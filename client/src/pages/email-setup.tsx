import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Mail, CheckCircle, ExternalLink, Settings, Trash2, TestTube2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";

interface EmailProvider {
  name: string;
  displayName: string;
  icon: string;
  scopes: string[];
}

interface EmailConnection {
  id: number;
  provider: string;
  email: string;
  isActive: boolean;
  lastTestSent?: string;
  createdAt: string;
}

export default function EmailSetupPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [testEmail, setTestEmail] = useState("");
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [selectedConnectionId, setSelectedConnectionId] = useState<number | null>(null);

  // Fetch available providers
  const { data: providers } = useQuery<Record<string, EmailProvider>>({
    queryKey: ["/api/email/providers"],
  });

  // Fetch user's email connections
  const { data: connections = [], isLoading } = useQuery<EmailConnection[]>({
    queryKey: ["/api/email/connections"],
  });

  // OAuth initiation mutation
  const oauthMutation = useMutation({
    mutationFn: async (provider: string) => {
      const response = await apiRequest("GET", `/api/oauth/${provider}/auth`);
      return response.json();
    },
    onSuccess: (data) => {
      window.location.href = data.authUrl;
    },
    onError: (error) => {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to initiate email connection",
        variant: "destructive",
      });
    },
  });

  // Test email mutation
  const testEmailMutation = useMutation({
    mutationFn: async ({ connectionId, email }: { connectionId: number; email: string }) => {
      const response = await apiRequest("POST", "/api/email/test", { connectionId, testEmail: email });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Test Email Sent! 📧",
        description: "Check your inbox to confirm the connection is working.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/email/connections"] });
      setIsTestDialogOpen(false);
      setTestEmail("");
    },
    onError: (error) => {
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : "Failed to send test email",
        variant: "destructive",
      });
    },
  });

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: async (connectionId: number) => {
      const response = await apiRequest("DELETE", `/api/email/connections/${connectionId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Disconnected",
        description: "Email connection removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/email/connections"] });
    },
    onError: (error) => {
      toast({
        title: "Disconnect Failed",
        description: error instanceof Error ? error.message : "Failed to disconnect email",
        variant: "destructive",
      });
    },
  });

  // Check for OAuth callback results
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailConnected = urlParams.get('email_connected');
    const connectedEmail = urlParams.get('email');
    const error = urlParams.get('error');

    if (emailConnected && connectedEmail) {
      toast({
        title: "Email Connected! 🎉",
        description: `Successfully connected ${connectedEmail}. Ready to send payment reminders!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/email/connections"] });
      // Clean up URL
      window.history.replaceState({}, '', '/email-setup');
    } else if (error) {
      toast({
        title: "Connection Failed",
        description: decodeURIComponent(error),
        variant: "destructive",
      });
      // Clean up URL
      window.history.replaceState({}, '', '/email-setup');
    }
  }, [toast, queryClient]);

  const handleConnect = (provider: string) => {
    oauthMutation.mutate(provider);
  };

  const handleTestEmail = (connectionId: number) => {
    setSelectedConnectionId(connectionId);
    setIsTestDialogOpen(true);
  };

  const handleSendTest = () => {
    if (selectedConnectionId && testEmail) {
      testEmailMutation.mutate({ connectionId: selectedConnectionId, email: testEmail });
    }
  };

  const handleDisconnect = (connectionId: number) => {
    if (confirm("Are you sure you want to disconnect this email? You'll need to reconnect to send reminders.")) {
      disconnectMutation.mutate(connectionId);
    }
  };

  if (isLoading) {
    return (
      <>
        <header className="bg-background border-b border-border">
          <div className="px-8 py-6">
            <h1 className="text-2xl font-semibold text-foreground">Email Setup</h1>
            <p className="text-sm text-muted-foreground mt-1">Connect your email to automatically send payment reminders</p>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-8 py-6 bg-background">
          <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
            <div className="h-48 bg-muted rounded-lg"></div>
            <div className="h-32 bg-muted rounded-lg"></div>
          </div>
        </main>
      </>
    );
  }

  const activeConnection = connections.find(conn => conn.isActive);

  return (
    <>
      <header className="bg-background border-b border-border">
        <div className="px-8 py-6">
          <h1 className="text-2xl font-semibold text-foreground">Email Setup</h1>
          <p className="text-sm text-muted-foreground mt-1">Connect your email to automatically send payment reminders</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-8 py-6 bg-background">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Clean connection status */}
          {activeConnection && (
            <div className="bg-muted border border-border rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-background rounded-full flex items-center justify-center border">
                  <CheckCircle className="h-3 w-3 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Email connected</p>
                  <p className="text-xs text-muted-foreground">Reminders will be sent from {activeConnection.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Connect Email Providers */}
          {!activeConnection && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">
                  Connect your email
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Choose your email provider to send payment reminders. We only need permission to send emails.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Clean steps - no ugly box */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium">1</div>
                    <span>Sign in to your email account</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium">2</div>
                    <span>Give permission to send emails only</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium">3</div>
                    <span>We'll send you a test email to confirm it works</span>
                  </div>
                </div>

                {/* Clean provider buttons */}
                <div className="space-y-3">
                  {providers && Object.values(providers).map((provider) => (
                    <div key={provider.name} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-xl">{provider.icon}</div>
                          <div>
                            <h3 className="font-medium text-foreground">{provider.displayName}</h3>
                            <p className="text-xs text-muted-foreground">
                              Connect your {provider.displayName} account
                            </p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleConnect(provider.name)}
                          disabled={oauthMutation.isPending}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 text-sm"
                        >
                          {oauthMutation.isPending ? "Connecting..." : "Connect"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Connected Email Management */}
          {connections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-600" />
                  Connected Emails
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {connections.map((connection) => (
                    <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {providers?.[connection.provider]?.icon || "📧"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{connection.email}</span>
                            {connection.isActive && (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {providers?.[connection.provider]?.displayName} • 
                            Connected {new Date(connection.createdAt).toLocaleDateString()}
                            {connection.lastTestSent && (
                              <> • Last test: {new Date(connection.lastTestSent).toLocaleDateString()}</>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestEmail(connection.id)}
                          disabled={testEmailMutation.isPending}
                        >
                          <TestTube2 className="w-4 h-4 mr-1" />
                          Test
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisconnect(connection.id)}
                          disabled={disconnectMutation.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </main>

      {/* Test Email Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              We'll send a test email to confirm your connection is working. 
              This lets you see exactly what your customers will receive.
            </p>
            <div className="space-y-2">
              <Label htmlFor="testEmail">Send test email to:</Label>
              <Input
                id="testEmail"
                type="email"
                placeholder="your-email@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsTestDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSendTest}
                disabled={!testEmail || testEmailMutation.isPending}
              >
                {testEmailMutation.isPending ? "Sending..." : "Send Test Email"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}