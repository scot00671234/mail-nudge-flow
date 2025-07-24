import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import MetricsCards from "@/components/dashboard/metrics-cards";
import RecentInvoices from "@/components/dashboard/recent-invoices";
import QuickActions from "@/components/dashboard/quick-actions";
import RecentActivity from "@/components/dashboard/recent-activity";
import UpcomingNudges from "@/components/dashboard/upcoming-nudges";
import UploadModal from "@/components/invoices/upload-modal";
// WelcomeGuide removed - users go straight to dashboard
import FirstInvoicePrompt from "@/components/onboarding/first-invoice-prompt";
import { EmailConnectionBanner } from "@/components/dashboard/email-connection-banner";
import { PageHeader } from "@/components/layout/page-header";
import type { DashboardMetrics } from "@/lib/types";

export default function Dashboard() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  // Welcome guide state removed
  const [showFirstInvoicePrompt, setShowFirstInvoicePrompt] = useState(false);

  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  // Show first invoice prompt for new users (no welcome popup)
  useEffect(() => {
    if (metrics && metrics.outstandingInvoices === 0) {
      setShowFirstInvoicePrompt(true);
    }
  }, [metrics]);

  const handleUploadInvoice = () => {
    setIsUploadModalOpen(true);
  };

  const handleCreateInvoice = () => {
    setIsUploadModalOpen(true);
  };

  // Removed welcome handlers since we're not showing the welcome guide

  const handleFirstInvoiceDismiss = () => {
    setShowFirstInvoicePrompt(false);
  };

  return (
    <>
      <PageHeader 
        title="Overview" 
        description="See how your invoices are doing"
      >
        <div className="flex items-center space-x-3">
          <Button 
            onClick={handleUploadInvoice}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-5 py-2.5 text-sm font-medium"
          >
            <Plus className="mr-2 w-4 h-4" />
            New Invoice
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground rounded-xl">
            <Bell className="w-4 h-4" />
          </Button>
        </div>
      </PageHeader>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-8 py-6 bg-background">
        {/* Metrics Cards */}
        {metricsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border/50 p-6 animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : metrics ? (
          <MetricsCards metrics={metrics} />
        ) : null}

        {/* Email Connection Banner */}
        <div className="mb-8">
          <EmailConnectionBanner />
        </div>

        {/* First Invoice Prompt for new users */}
        {showFirstInvoicePrompt && metrics && metrics.outstandingInvoices === 0 && (
          <div className="mb-8">
            <FirstInvoicePrompt
              onUploadInvoice={() => {
                setShowFirstInvoicePrompt(false);
                handleUploadInvoice();
              }}
              onCreateInvoice={() => {
                setShowFirstInvoicePrompt(false);
                handleCreateInvoice();
              }}
              onDismiss={handleFirstInvoiceDismiss}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Invoices */}
          <div className="lg:col-span-2">
            <RecentInvoices />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <QuickActions 
              onUploadInvoice={handleUploadInvoice}
              onCreateInvoice={handleCreateInvoice}
            />
            <RecentActivity />
          </div>
        </div>

        {/* Upcoming Nudges */}
        <div className="mt-6">
          <UpcomingNudges />
        </div>
      </main>

      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />

      {/* Welcome guide removed - users go straight to first invoice prompt */}
    </>
  );
}
