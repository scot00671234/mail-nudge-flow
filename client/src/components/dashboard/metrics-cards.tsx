import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, PlaneTakeoff, Clock } from "lucide-react";
import type { DashboardMetrics } from "@/lib/types";

interface MetricsCardsProps {
  metrics: DashboardMetrics;
}

export default function MetricsCards({ metrics }: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Outstanding Invoices</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.outstandingInvoices}</p>
            </div>
            <div className="w-12 h-12 bg-flow-warning bg-opacity-10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-flow-warning w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">
              ${metrics.outstandingValue.toLocaleString()} total value
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Rate</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.responseRate}%</p>
            </div>
            <div className="w-12 h-12 bg-flow-success bg-opacity-10 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-flow-success w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-flow-success">↗ +5.2% from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nudges Sent</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.nudgesSent}</p>
            </div>
            <div className="w-12 h-12 bg-flow-blue bg-opacity-10 rounded-lg flex items-center justify-center">
              <PlaneTakeoff className="text-flow-blue w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">This month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Collection Time</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.avgCollectionTime}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="text-purple-600 w-6 h-6" />
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
