import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import LandingPage from "@/pages/landing-page-new";
import AuthPage from "@/pages/auth-page";
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
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/reset-password" component={AuthPage} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/invoices" component={Invoices} />
      <ProtectedRoute path="/customers" component={Customers} />
      <ProtectedRoute path="/email-templates" component={EmailTemplates} />
      <ProtectedRoute path="/nudge-settings" component={NudgeSettings} />
      <ProtectedRoute path="/analytics" component={Analytics} />
      <ProtectedRoute path="/account" component={AccountSettings} />
      <ProtectedRoute path="/email-setup" component={EmailSetup} />
      <Route path="/" component={LandingPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
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
