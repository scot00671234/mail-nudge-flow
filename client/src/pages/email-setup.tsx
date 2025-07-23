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
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="py-4">
              <h1 className="text-2xl font-bold text-gray-900">Email Setup</h1>
              <p className="text-sm text-gray-500">Connect your email to send payment reminders</p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </main>
      </>
    );
  }

  const activeConnection = connections.find(conn => conn.isActive);

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900">Email Setup</h1>
            <p className="text-sm text-gray-500">Connect your email to automatically send payment reminders</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Connection Status */}
          {activeConnection ? (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Email connected!</strong> Payment reminders will be sent from {activeConnection.email}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>No email connected.</strong> Connect your email to start sending automatic payment reminders.
              </AlertDescription>
            </Alert>
          )}

          {/* Connect Email Providers */}
          {!activeConnection && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  Connect Your Email
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Choose your email provider to get started. We only need permission to send emails - we never read your inbox.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* What Happens Next Section */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Here's what happens next:</h3>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>1. 🔐 Sign in to your email account</li>
                    <li>2. ✅ Give Flow permission to send emails only</li>
                    <li>3. 🧪 We'll send you a test email to confirm it works</li>
                    <li>4. 🎉 Start sending automatic payment reminders!</li>
                  </ol>
                </div>

                {/* Privacy Assurance */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Your email stays yours:</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• We never read your emails or access your inbox</li>
                    <li>• We only send payment reminders that you approve</li>
                    <li>• You can disconnect anytime with one click</li>
                    <li>• All connections use secure OAuth2 authentication</li>
                  </ul>
                </div>

                {/* Provider Buttons */}
                <div className="grid md:grid-cols-2 gap-4">
                  {providers && Object.values(providers).map((provider) => (
                    <Card key={provider.name} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-6 text-center">
                        <div className="text-4xl mb-3">{provider.icon}</div>
                        <h3 className="font-semibold text-lg mb-2">{provider.displayName}</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Connect your {provider.displayName} account to send reminders
                        </p>
                        <Button 
                          onClick={() => handleConnect(provider.name)}
                          disabled={oauthMutation.isPending}
                          className="w-full"
                        >
                          {oauthMutation.isPending ? "Connecting..." : `Connect ${provider.displayName}`}
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
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