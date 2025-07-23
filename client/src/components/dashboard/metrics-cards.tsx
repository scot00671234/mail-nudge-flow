import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, PlaneTakeoff, Clock } from "lucide-react";
import type { DashboardMetrics } from "@/lib/types";

interface MetricsCardsProps {
  metrics: DashboardMetrics;
}

export default function MetricsCards({ metrics }: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <Card className="border-border/40 bg-card hover:shadow-lg transition-all duration-300">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Outstanding Invoices</p>
              <p className="text-4xl font-semibold text-foreground tracking-tight">{metrics.outstandingInvoices}</p>
            </div>
            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="text-orange-500 w-7 h-7" />
            </div>
          </div>
          <div className="mt-6">
            <span className="text-sm text-muted-foreground">
              ${metrics.outstandingValue.toLocaleString()} total value
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/40 bg-card hover:shadow-lg transition-all duration-300">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
              <p className="text-4xl font-semibold text-foreground tracking-tight">{metrics.responseRate}%</p>
            </div>
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
              <TrendingUp className="text-green-500 w-7 h-7" />
            </div>
          </div>
          <div className="mt-6">
            <span className="text-sm text-green-500 font-medium">↗ +5.2% from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/40 bg-card hover:shadow-lg transition-all duration-300">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nudges Sent</p>
              <p className="text-4xl font-semibold text-foreground tracking-tight">{metrics.nudgesSent}</p>
            </div>
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
              <PlaneTakeoff className="text-primary w-7 h-7" />
            </div>
          </div>
          <div className="mt-6">
            <span className="text-sm text-muted-foreground">This month</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/40 bg-card hover:shadow-lg transition-all duration-300">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Collection Time</p>
              <p className="text-4xl font-semibold text-foreground tracking-tight">{metrics.avgCollectionTime}</p>
            </div>
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center">
              <Clock className="text-purple-500 w-7 h-7" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">days</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
