import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, PlaneTakeoff, Plus, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Activity } from "@/lib/types";

function getActivityIcon(type: string) {
  switch (type) {
    case "payment_received":
      return <Check className="text-flow-success w-3 h-3" />;
    case "nudge_sent":
      return <PlaneTakeoff className="text-flow-blue w-3 h-3" />;
    case "invoice_created":
      return <Plus className="text-purple-600 w-3 h-3" />;
    case "invoice_overdue":
      return <AlertTriangle className="text-flow-warning w-3 h-3" />;
    default:
      return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
  }
}

function getActivityIconBg(type: string) {
  switch (type) {
    case "payment_received":
      return "bg-flow-success bg-opacity-10";
    case "nudge_sent":
      return "bg-flow-blue bg-opacity-10";
    case "invoice_created":
      return "bg-purple-100";
    case "invoice_overdue":
      return "bg-flow-warning bg-opacity-10";
    default:
      return "bg-gray-100";
  }
}

export default function RecentActivity() {
  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No recent activity</p>
        ) : (
          <>
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 ${getActivityIconBg(activity.type)} rounded-full flex items-center justify-center flex-shrink-0`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {activity.createdAt 
                      ? new Date(activity.createdAt).toLocaleString()
                      : "Just now"
                    }
                  </p>
                </div>
              </div>
            ))}
            
            <Button
              variant="ghost"
              className="w-full mt-4 text-sm text-flow-blue hover:text-blue-700 font-medium"
            >
              View All Activity
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
