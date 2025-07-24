import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Crown, Zap, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";

interface FooterConfig {
  shouldIncludeFooter: boolean;
  canToggleFooter: boolean;
  currentSetting: boolean;
  plan: string;
}

export function EmailFooterSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch footer configuration
  const { data: footerConfig, isLoading } = useQuery<FooterConfig>({
    queryKey: ["/api/email/footer-config"],
  });

  // Update footer preference mutation
  const updateFooterMutation = useMutation({
    mutationFn: async (hideFooter: boolean) => {
      const response = await apiRequest("PUT", "/api/email/footer-preference", { hideFooter });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Footer Settings Updated",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/email/footer-config"] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update footer settings",
        variant: "destructive",
      });
    },
  });

  const handleFooterToggle = (checked: boolean) => {
    updateFooterMutation.mutate(!checked); // !checked because switch shows "hide footer"
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email Footer Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!footerConfig) {
    return null;
  }

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'pro':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'enterprise':
        return <Zap className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'pro':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'enterprise':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Email Footer Settings
          <Badge variant="outline" className={getPlanColor(footerConfig.plan)}>
            {getPlanIcon(footerConfig.plan)}
            <span className="ml-1 capitalize">{footerConfig.plan}</span>
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage the "Powered by Flow" footer that appears in your payment reminder emails
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Current Footer Status */}
        <div className="space-y-3">
          <h4 className="font-medium">Current Status</h4>
          {footerConfig.shouldIncludeFooter ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                The Flow footer <strong>will appear</strong> on all payment reminder emails sent from your account.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-green-200 bg-green-50">
              <Info className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                The Flow footer is <strong>hidden</strong> from your payment reminder emails.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Footer Preview */}
        <div className="space-y-3">
          <h4 className="font-medium">Footer Preview</h4>
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="text-xs text-gray-500 text-center border-t pt-3">
              Powered by <a href="#" className="text-blue-600 underline">Flow</a> – invoicenudgerflow.com
            </div>
          </div>
        </div>

        {/* Footer Control */}
        <div className="space-y-4">
          <h4 className="font-medium">Footer Control</h4>
          
          {footerConfig.canToggleFooter ? (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="hide-footer" className="text-sm font-medium">
                  Hide Footer from Emails
                </Label>
                <p className="text-xs text-muted-foreground">
                  Remove the "Powered by Flow" footer from your payment reminders
                </p>
              </div>
              <Switch
                id="hide-footer"
                checked={!footerConfig.shouldIncludeFooter}
                onCheckedChange={handleFooterToggle}
                disabled={updateFooterMutation.isPending}
              />
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Footer customization is a Pro feature.</strong> 
                <br />
                Upgrade to Pro or Enterprise to hide the Flow footer from your emails and maintain professional branding.
                <br />
                <Button variant="outline" size="sm" className="mt-2">
                  Upgrade Plan
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Plan Information */}
        <div className="space-y-3">
          <h4 className="font-medium">Plan Details</h4>
          <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              <span><strong>Free Plan:</strong> Footer appears on all emails</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span><strong>Pro Plan:</strong> Optional footer control</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-muted-foreground rounded-full"></span>
              <span><strong>Enterprise Plan:</strong> Full branding customization</span>
            </div>
          </div>
        </div>

        {/* Important Note */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Note:</strong> If you downgrade your plan, the footer will automatically reappear on future emails to comply with our terms of service.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}