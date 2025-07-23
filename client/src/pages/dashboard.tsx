import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import MetricsCards from "@/components/dashboard/metrics-cards";
import RecentInvoices from "@/components/dashboard/recent-invoices";
import QuickActions from "@/components/dashboard/quick-actions";
import RecentActivity from "@/components/dashboard/recent-activity";
import UpcomingNudges from "@/components/dashboard/upcoming-nudges";
import UploadModal from "@/components/invoices/upload-modal";
import type { DashboardMetrics } from "@/lib/types";

export default function Dashboard() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  const handleUploadInvoice = () => {
    setIsUploadModalOpen(true);
  };

  const handleCreateInvoice = () => {
    setIsUploadModalOpen(true);
  };

  return (
    <>
      {/* Header */}
      <header className="bg-background border-b border-border/40">
        <div className="px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center">
              <div>
                <h1 className="text-3xl font-medium tracking-tight text-foreground">Dashboard</h1>
                <p className="text-muted-foreground mt-1">Monitor your invoice collection performance</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleUploadInvoice}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6"
              >
                <Plus className="mr-2 w-4 h-4" />
                Add Invoice
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground rounded-full">
                <Bell className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-background">
        {/* Metrics Cards */}
        {metricsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border/40 p-8 animate-pulse">
                <div className="h-20 bg-muted rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : metrics ? (
          <MetricsCards metrics={metrics} />
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
        <div className="mt-8">
          <UpcomingNudges />
        </div>
      </main>

      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />
    </>
  );
}
