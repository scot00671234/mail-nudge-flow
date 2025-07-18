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
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">Monitor your invoice nudging activities</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleUploadInvoice}
                className="bg-flow-blue text-white hover:bg-blue-600"
              >
                <Plus className="mr-2 w-4 h-4" />
                Add Invoice
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-500">
                <Bell className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {/* Metrics Cards */}
        {metricsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
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
