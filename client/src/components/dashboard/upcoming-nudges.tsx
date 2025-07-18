import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { NudgeScheduleWithInvoice, Invoice, Customer } from "@/lib/types";

export default function UpcomingNudges() {
  const { data: nudgeSchedules = [], isLoading } = useQuery({
    queryKey: ["/api/nudge-schedules/upcoming"],
  });

  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  // Combine nudge schedules with invoice and customer data
  const upcomingNudges: NudgeScheduleWithInvoice[] = nudgeSchedules.map(schedule => {
    const invoice = invoices.find(inv => inv.id === schedule.invoiceId);
    const customer = invoice ? customers.find(c => c.id === invoice.customerId) : undefined;
    return { ...schedule, invoice, customer };
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Nudges</h2>
            <p className="text-sm text-gray-500 mt-1">Scheduled nudges for the next 7 days</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Nudges</h2>
          <p className="text-sm text-gray-500 mt-1">Scheduled nudges for the next 7 days</p>
        </div>
      </CardHeader>
      
      <CardContent>
        {upcomingNudges.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No upcoming nudges scheduled</p>
        ) : (
          <div className="space-y-4">
            {upcomingNudges.map((nudge) => (
              <div
                key={nudge.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    nudge.nudgeType === "final_notice" 
                      ? "bg-flow-danger bg-opacity-10" 
                      : "bg-flow-blue bg-opacity-10"
                  }`}>
                    {nudge.nudgeType === "final_notice" ? (
                      <AlertTriangle className={`w-5 h-5 ${
                        nudge.nudgeType === "final_notice" ? "text-flow-danger" : "text-flow-blue"
                      }`} />
                    ) : (
                      <Calendar className="text-flow-blue w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {nudge.invoice?.number} - {nudge.nudgeType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <p className="text-sm text-gray-500">
                      {nudge.customer?.name} • ${nudge.invoice ? parseFloat(nudge.invoice.amount).toLocaleString() : 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    {new Date(nudge.scheduledDate).toLocaleDateString()} at{" "}
                    {new Date(nudge.scheduledDate).toLocaleTimeString([], { 
                      hour: 'numeric', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </span>
                  <Button variant="ghost" size="sm" className="text-flow-blue hover:text-blue-700">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                    Cancel
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="mt-6 text-center">
              <Button variant="ghost" className="text-flow-blue hover:text-blue-700 font-medium">
                View All Scheduled Nudges
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
