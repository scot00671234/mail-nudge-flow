import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, PlaneTakeoff, Clock } from "lucide-react";
import type { DashboardMetrics } from "@/lib/types";

interface MetricsCardsProps {
  metrics: DashboardMetrics;
}

export default function MetricsCards({ metrics }: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="border-border/50 bg-card hover:shadow-sm transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Outstanding Invoices</p>
              <p className="text-3xl font-semibold text-foreground mt-2">{metrics.outstandingInvoices}</p>
            </div>
            <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-muted-foreground w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs text-muted-foreground">
              ${metrics.outstandingValue.toLocaleString()} total value
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card hover:shadow-sm transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Response Rate</p>
              <p className="text-3xl font-semibold text-foreground mt-2">{metrics.responseRate}%</p>
            </div>
            <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
              <TrendingUp className="text-muted-foreground w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs text-muted-foreground">This month</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card hover:shadow-sm transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Reminders Sent</p>
              <p className="text-3xl font-semibold text-foreground mt-2">{metrics.nudgesSent}</p>
            </div>
            <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
              <PlaneTakeoff className="text-muted-foreground w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs text-muted-foreground">This month</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card hover:shadow-sm transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avg. Collection Time</p>
              <p className="text-3xl font-semibold text-foreground mt-2">{metrics.avgCollectionTime}</p>
            </div>
            <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
              <Clock className="text-muted-foreground w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs text-muted-foreground">days</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
