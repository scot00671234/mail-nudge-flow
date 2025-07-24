import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  PlaneTakeoff,
  Users,
  FileText,
  Download
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { DashboardMetrics, Invoice, Customer, Activity } from "@/lib/types";
import { useState } from "react";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ReactNode;
  description?: string;
}

function AnalyticsCard({ title, value, change, trend, icon, description }: AnalyticsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {change && (
              <div className="flex items-center mt-2">
                {trend === "up" && <TrendingUp className="w-4 h-4 text-flow-success mr-1" />}
                {trend === "down" && <TrendingDown className="w-4 h-4 text-flow-danger mr-1" />}
                <span className={`text-sm ${
                  trend === "up" ? "text-flow-success" : 
                  trend === "down" ? "text-flow-danger" : 
                  "text-gray-500"
                }`}>
                  {change}
                </span>
              </div>
            )}
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
          <div className="w-12 h-12 bg-flow-blue bg-opacity-10 rounded-lg flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("30d");

  const { data: metrics } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
    select: (data) => data.slice(0, 50), // Get more activities for analytics
  });

  // Calculate analytics data
  const totalInvoices = invoices.length;
  const totalCustomers = customers.length;
  const totalRevenue = invoices
    .filter(inv => inv.status === "paid")
    .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);

  const overdueInvoices = invoices.filter(inv => {
    return inv.status !== "paid" && new Date(inv.dueDate) < new Date();
  });

  const paidInvoices = invoices.filter(inv => inv.status === "paid");
  const averagePaymentTime = paidInvoices.length > 0 
    ? paidInvoices.reduce((sum, inv) => {
        if (inv.paidDate) {
          const diffTime = new Date(inv.paidDate).getTime() - new Date(inv.issueDate).getTime();
          return sum + Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
        return sum;
      }, 0) / paidInvoices.length
    : 0;

  const nudgeActivities = activities.filter(activity => activity.type === "nudge_sent");
  const paymentActivities = activities.filter(activity => activity.type === "payment_received");

  // Calculate success rate (payments received after nudges)
  const nudgeSuccessRate = nudgeActivities.length > 0 
    ? (paymentActivities.length / nudgeActivities.length * 100).toFixed(1)
    : "0";

  // Trend calculations will be implemented with real data
  const invoiceGrowth = "–";
  const revenueGrowth = "–";
  const responseGrowth = "–";

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <p className="text-sm text-gray-500">Performance insights and reporting</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="mr-2 w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AnalyticsCard
            title="Total Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            change={revenueGrowth}
            trend="up"
            icon={<DollarSign className="text-flow-blue w-6 h-6" />}
            description="From paid invoices"
          />
          
          <AnalyticsCard
            title="Total Invoices"
            value={totalInvoices}
            change={invoiceGrowth}
            trend="up"
            icon={<FileText className="text-flow-success w-6 h-6" />}
            description="All time"
          />
          
          <AnalyticsCard
            title="Active Customers"
            value={totalCustomers}
            change="+3"
            trend="up"
            icon={<Users className="text-muted-foreground w-6 h-6" />}
            description="Total customers"
          />
          
          <AnalyticsCard
            title="Avg. Payment Time"
            value={`${Math.round(averagePaymentTime)} days`}
            change="-2 days"
            trend="up"
            icon={<Clock className="text-flow-warning w-6 h-6" />}
            description="From issue to payment"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Nudge Performance */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Nudge Performance</h2>
                <p className="text-sm text-gray-500">How effective your payment reminders are</p>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-flow-blue bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <PlaneTakeoff className="text-flow-blue w-6 h-6" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{nudgeActivities.length}</p>
                    <p className="text-sm text-gray-600">Nudges Sent</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-flow-success bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <TrendingUp className="text-flow-success w-6 h-6" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{nudgeSuccessRate}%</p>
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                      <BarChart3 className="text-muted-foreground w-6 h-6" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{metrics?.responseRate || 0}%</p>
                    <p className="text-sm text-gray-600">Response Rate</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">First Reminder</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-flow-blue h-2 rounded-full" style={{ width: "65%" }}></div>
                      </div>
                      <span className="text-sm text-gray-600">65%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Second Reminder</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-flow-warning h-2 rounded-full" style={{ width: "45%" }}></div>
                      </div>
                      <span className="text-sm text-gray-600">45%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Final Notice</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-flow-danger h-2 rounded-full" style={{ width: "25%" }}></div>
                      </div>
                      <span className="text-sm text-gray-600">25%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invoice Status Breakdown */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Invoice Status Breakdown</h2>
                <p className="text-sm text-gray-500">Current state of all invoices</p>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {[
                    { status: "Paid", count: paidInvoices.length, color: "bg-flow-success", percentage: (paidInvoices.length / totalInvoices * 100).toFixed(1) },
                    { status: "Pending", count: invoices.filter(inv => inv.status === "pending").length, color: "bg-yellow-500", percentage: (invoices.filter(inv => inv.status === "pending").length / totalInvoices * 100).toFixed(1) },
                    { status: "Overdue", count: overdueInvoices.length, color: "bg-flow-danger", percentage: (overdueInvoices.length / totalInvoices * 100).toFixed(1) },
                    { status: "Sent", count: invoices.filter(inv => inv.status === "sent").length, color: "bg-flow-blue", percentage: (invoices.filter(inv => inv.status === "sent").length / totalInvoices * 100).toFixed(1) },
                  ].map((item) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                        <span className="text-sm font-medium text-gray-700">{item.status}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{item.count} invoices</span>
                        <span className="text-sm text-gray-500">({item.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Outstanding Amount</span>
                  <span className="font-semibold text-gray-900">
                    ${(metrics?.outstandingValue || 0).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Overdue Invoices</span>
                  <span className="font-semibold text-flow-danger">{overdueInvoices.length}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Collection Rate</span>
                  <span className="font-semibold text-flow-success">
                    {totalInvoices > 0 ? (paidInvoices.length / totalInvoices * 100).toFixed(1) : 0}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Active Templates</span>
                  <span className="font-semibold text-gray-900">3</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-flow-blue bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-flow-blue rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">
                          {activity.createdAt 
                            ? new Date(activity.createdAt).toLocaleDateString()
                            : "Today"
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Invoice Volume</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-flow-success" />
                    <span className="text-sm text-flow-success">{invoiceGrowth}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Revenue Growth</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-flow-success" />
                    <span className="text-sm text-flow-success">{revenueGrowth}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Response Rate</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-flow-success" />
                    <span className="text-sm text-flow-success">{responseGrowth}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
