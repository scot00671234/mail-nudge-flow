import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import LandingPage from "@/pages/landing-page-new";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Invoices from "@/pages/invoices";
import Customers from "@/pages/customers";
import EmailTemplates from "@/pages/email-templates";
import NudgeSettings from "@/pages/nudge-settings";
import Analytics from "@/pages/analytics";
import AccountSettings from "@/pages/account-settings";
import EmailSetup from "@/pages/email-setup";
import Sidebar from "@/components/layout/sidebar";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={LandingPage} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/invoices" component={Invoices} />
          <Route path="/customers" component={Customers} />
          <Route path="/email-templates" component={EmailTemplates} />
          <Route path="/nudge-settings" component={NudgeSettings} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/account" component={AccountSettings} />
          <Route path="/email-setup" component={EmailSetup} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
