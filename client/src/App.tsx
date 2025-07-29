import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth/auth-provider";
import { useAuth } from "@/hooks/use-auth";
import { OnboardingProvider } from "@/components/onboarding/onboarding-provider";
import LandingPage from "@/pages/landing-page-new";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Settings from "@/pages/settings";
import Invoices from "@/pages/invoices";
import Customers from "@/pages/customers";
import EmailTemplates from "@/pages/email-templates";
import NudgeSettings from "@/pages/nudge-settings";
import Analytics from "@/pages/analytics";
import AccountSettings from "@/pages/account-settings";
import EmailSetup from "@/pages/email-setup";
// Removed sidebar components for full dashboard experience

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={LandingPage} />
          <Route path="/auth" component={AuthPage} />
        </>
      ) : (
        <Switch>
          <Route path="/" component={Dashboard} />
        <Route path="/settings" component={Settings} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/invoices" component={Dashboard} />
          <Route path="/customers" component={Dashboard} />
          <Route path="/email-setup" component={Dashboard} />
        </Switch>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OnboardingProvider>
          <AppContent />
        </OnboardingProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
