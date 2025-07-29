import React, { useState, useCallback, useMemo } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Plus, 
  X, 
  GripVertical, 
  Mail, 
  DollarSign, 
  TrendingUp, 
  Users, 
  FileText, 
  Clock, 
  AlertTriangle,
  Settings,
  BarChart3,
  Activity,
  Maximize2,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import type { DashboardMetrics } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { EmailFlowWidget } from './email-flow-widget';
import { Link } from 'wouter';

// Widget types
export type WidgetType = 
  | 'metrics-overview'
  | 'outstanding-invoices' 
  | 'email-status'
  | 'recent-activity'
  | 'quick-actions'
  | 'payment-reminders'
  | 'customer-insights'
  | 'performance-chart'
  | 'email-flow-setup';

interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  icon: React.ElementType;
  size: 'small' | 'medium' | 'large';
  color: string;
}

// Available widgets catalog
const AVAILABLE_WIDGETS: Omit<Widget, 'id'>[] = [
  {
    type: 'metrics-overview',
    title: 'Key Metrics',
    icon: BarChart3,
    size: 'large',
    color: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
  },
  {
    type: 'outstanding-invoices',
    title: 'Outstanding Invoices',
    icon: FileText,
    size: 'medium',
    color: 'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800'
  },
  {
    type: 'email-status',
    title: 'Email Connection',
    icon: Mail,
    size: 'medium',
    color: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
  },
  {
    type: 'recent-activity',
    title: 'Recent Activity',
    icon: Activity,
    size: 'medium',
    color: 'bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800'
  },
  {
    type: 'quick-actions',
    title: 'Quick Actions',
    icon: Plus,
    size: 'small',
    color: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950 dark:border-indigo-800'
  },
  {
    type: 'payment-reminders',
    title: 'Payment Reminders',
    icon: Clock,
    size: 'medium',
    color: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800'
  },
  {
    type: 'customer-insights',
    title: 'Customer Insights',
    icon: Users,
    size: 'medium',
    color: 'bg-teal-50 border-teal-200 dark:bg-teal-950 dark:border-teal-800'
  },
  {
    type: 'performance-chart',
    title: 'Performance Chart',
    icon: TrendingUp,
    size: 'large',
    color: 'bg-pink-50 border-pink-200 dark:bg-pink-950 dark:border-pink-800'
  },
  {
    type: 'email-flow-setup',
    title: 'Email Flow Setup',
    icon: Settings,
    size: 'large',
    color: 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 border-blue-200 dark:border-blue-800'
  }
];

// Default dashboard layout
const DEFAULT_WIDGETS: Widget[] = [
  { ...AVAILABLE_WIDGETS[0], id: 'widget-1' }, // Key Metrics
  { ...AVAILABLE_WIDGETS[1], id: 'widget-2' }, // Outstanding Invoices
  { ...AVAILABLE_WIDGETS[2], id: 'widget-3' }, // Email Status
  { ...AVAILABLE_WIDGETS[4], id: 'widget-4' }, // Quick Actions
  { ...AVAILABLE_WIDGETS[8], id: 'widget-5' }  // Email Flow Setup
];

// Widget content components
const MetricsOverviewWidget = () => {
  const { data: metrics } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-orange-600">
          {metrics?.outstandingInvoices || 0}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Outstanding</div>
        <div className="text-xs text-gray-500">
          {formatCurrency(metrics?.outstandingValue || 0)}
        </div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">
          {metrics?.responseRate || 0}%
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Response Rate</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">
          {metrics?.remindersSent || 0}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Reminders Sent</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-600">
          {metrics?.avgCollectionTime || 0}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Avg Days</div>
      </div>
    </div>
  );
};

const OutstandingInvoicesWidget = () => {
  const { data: invoices } = useQuery({
    queryKey: ["/api/invoices"],
  });

  const overdueInvoices = invoices?.filter((inv: any) => inv.status === 'overdue') || [];

  return (
    <div className="space-y-3">
      {overdueInvoices.length === 0 ? (
        <div className="text-center text-gray-500 py-4">
          No overdue invoices
        </div>
      ) : (
        overdueInvoices.slice(0, 3).map((invoice: any) => (
          <div key={invoice.id} className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-950 rounded-md">
            <div>
              <div className="font-medium">#{invoice.number}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{invoice.customerName}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-red-600">{formatCurrency(invoice.amount)}</div>
              <div className="text-xs text-red-500">Overdue</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const EmailStatusWidget = () => {
  return (
    <div className="text-center space-y-3">
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full text-sm">
        <AlertTriangle size={14} />
        Not Connected
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Connect your email to send payment reminders
      </p>
      <Button size="sm" className="w-full">
        <Mail size={14} className="mr-2" />
        Connect Email
      </Button>
    </div>
  );
};

const RecentActivityWidget = () => {
  const { data: activities } = useQuery({
    queryKey: ["/api/activities"],
  });

  return (
    <div className="space-y-2">
      {!activities || activities.length === 0 ? (
        <div className="text-center text-gray-500 py-4">
          No recent activity
        </div>
      ) : (
        activities.slice(0, 4).map((activity: any, index: number) => (
          <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
            <div className="text-sm">{activity.description}</div>
          </div>
        ))
      )}
    </div>
  );
};

const QuickActionsWidget = () => {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button size="sm" variant="outline" className="h-auto py-3 flex flex-col gap-1">
        <FileText size={16} />
        <span className="text-xs">New Invoice</span>
      </Button>
      <Button size="sm" variant="outline" className="h-auto py-3 flex flex-col gap-1">
        <Users size={16} />
        <span className="text-xs">Add Customer</span>
      </Button>
      <Button size="sm" variant="outline" className="h-auto py-3 flex flex-col gap-1">
        <Mail size={16} />
        <span className="text-xs">Send Reminder</span>
      </Button>
      <Button size="sm" variant="outline" className="h-auto py-3 flex flex-col gap-1">
        <Settings size={16} />
        <span className="text-xs">Settings</span>
      </Button>
    </div>
  );
};

// Widget renderer
const renderWidgetContent = (type: WidgetType) => {
  switch (type) {
    case 'metrics-overview':
      return <MetricsOverviewWidget />;
    case 'outstanding-invoices':
      return <OutstandingInvoicesWidget />;
    case 'email-status':
      return <EmailStatusWidget />;
    case 'recent-activity':
      return <RecentActivityWidget />;
    case 'quick-actions':
      return <QuickActionsWidget />;
    case 'email-flow-setup':
      return <EmailFlowWidget />;
    default:
      return (
        <div className="text-center text-gray-500 py-4">
          Widget content coming soon
        </div>
      );
  }
};

// Widget popup content components
const MetricsDetailedWidget = () => {
  const { data: metrics } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { data: invoices } = useQuery({
    queryKey: ["/api/invoices"],
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {metrics?.outstandingInvoices || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Outstanding Invoices</div>
          <div className="text-lg font-semibold text-orange-700">
            {formatCurrency(metrics?.outstandingValue || 0)}
          </div>
        </div>
        <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {metrics?.responseRate || 0}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Response Rate</div>
          <div className="text-sm text-green-700">This month</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {metrics?.remindersSent || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Reminders Sent</div>
          <div className="text-sm text-blue-700">This month</div>
        </div>
        <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {metrics?.avgCollectionTime || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Collection</div>
          <div className="text-sm text-purple-700">days</div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium">Recent Trends</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
            <span className="text-sm">Payment success rate</span>
            <span className="text-sm font-medium text-green-600">+12% this month</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
            <span className="text-sm">Average response time</span>
            <span className="text-sm font-medium text-blue-600">-2 days faster</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button asChild className="flex-1">
          <Link href="/invoices">
            <FileText size={16} className="mr-2" />
            View All Invoices
          </Link>
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <Link href="/analytics">
            <BarChart3 size={16} className="mr-2" />
            Detailed Analytics
          </Link>
        </Button>
      </div>
    </div>
  );
};

const QuickActionsDetailedWidget = () => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Quick Actions</h4>
      <div className="grid grid-cols-2 gap-3">
        <Button asChild className="h-auto py-4 flex flex-col gap-2">
          <Link href="/invoices">
            <FileText size={24} />
            <span>Create Invoice</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4 flex flex-col gap-2">
          <Link href="/customers">
            <Users size={24} />
            <span>Add Customer</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4 flex flex-col gap-2">
          <Link href="/email-setup">
            <Mail size={24} />
            <span>Email Setup</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
          <Settings size={24} />
          <span>Settings</span>
        </Button>
      </div>
      
      <div className="space-y-3 pt-4 border-t">
        <h5 className="text-sm font-medium">Recent Actions</h5>
        <div className="space-y-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            No recent actions yet. Start by creating your first invoice!
          </div>
        </div>
      </div>
    </div>
  );
};

// Sortable widget component
interface SortableWidgetProps {
  widget: Widget;
  onRemove: (id: string) => void;
  onExpand: (widget: Widget) => void;
}

const SortableWidget: React.FC<SortableWidgetProps> = ({ widget, onRemove, onExpand }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = widget.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group",
        widget.size === 'small' && "col-span-1",
        widget.size === 'medium' && "col-span-1 md:col-span-2",
        widget.size === 'large' && "col-span-1 md:col-span-3",
        isDragging && "z-50 opacity-50"
      )}
    >
      <Card className={cn("h-full transition-all duration-200 cursor-pointer hover:shadow-md", widget.color)}
        onClick={() => onExpand(widget)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon size={18} className="text-gray-600 dark:text-gray-400" />
              <CardTitle className="text-sm">{widget.title}</CardTitle>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExpand(widget);
                }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title="Expand widget"
              >
                <Maximize2 size={14} className="text-gray-500" />
              </button>
              <button
                {...attributes}
                {...listeners}
                onClick={(e) => e.stopPropagation()}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-grab active:cursor-grabbing"
                title="Drag to reorder"
              >
                <GripVertical size={14} className="text-gray-500" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(widget.id);
                }}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                title="Remove widget"
              >
                <X size={14} className="text-red-500" />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {renderWidgetContent(widget.type)}
        </CardContent>
      </Card>
    </div>
  );
};

// Widget selector
interface WidgetSelectorProps {
  onAdd: (widget: Omit<Widget, 'id'>) => void;
  usedTypes: WidgetType[];
}

const WidgetSelector: React.FC<WidgetSelectorProps> = ({ onAdd, usedTypes }) => {
  return (
    <Card className="border-dashed border-2 border-gray-300 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Plus size={16} />
          Add Widget
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {AVAILABLE_WIDGETS.map((widget) => {
            const Icon = widget.icon;
            const isUsed = usedTypes.includes(widget.type);
            
            return (
              <Button
                key={widget.type}
                size="sm"
                variant="outline"
                disabled={isUsed}
                onClick={() => onAdd(widget)}
                className="h-auto py-3 flex flex-col gap-1"
              >
                <Icon size={16} />
                <span className="text-xs">{widget.title}</span>
                {isUsed && <Badge variant="secondary" className="text-xs">Added</Badge>}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Main customizable dashboard component
export const CustomizableDashboard: React.FC = () => {
  const [widgets, setWidgets] = useState<Widget[]>(DEFAULT_WIDGETS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expandedWidget, setExpandedWidget] = useState<Widget | null>(null);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setWidgets((widgets) => {
        const oldIndex = widgets.findIndex((w) => w.id === active.id);
        const newIndex = widgets.findIndex((w) => w.id === over.id);
        return arrayMove(widgets, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  }, []);

  const handleAddWidget = useCallback((widgetTemplate: Omit<Widget, 'id'>) => {
    const newWidget: Widget = {
      ...widgetTemplate,
      id: `widget-${Date.now()}`
    };
    setWidgets((prev) => [...prev, newWidget]);
  }, []);

  const handleRemoveWidget = useCallback((id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const handleExpandWidget = useCallback((widget: Widget) => {
    setExpandedWidget(widget);
  }, []);

  const usedTypes = useMemo(() => widgets.map((w) => w.type), [widgets]);

  const activeWidget = activeId ? widgets.find((w) => w.id === activeId) : null;

  // Render expanded widget content
  const renderExpandedContent = (widget: Widget) => {
    switch (widget.type) {
      case 'metrics-overview':
        return <MetricsDetailedWidget />;
      case 'quick-actions':
        return <QuickActionsDetailedWidget />;
      case 'email-flow-setup':
        return <EmailFlowWidget />;
      case 'outstanding-invoices':
        return (
          <div className="space-y-4">
            <OutstandingInvoicesWidget />
            <Button asChild className="w-full">
              <Link href="/invoices">
                <FileText size={16} className="mr-2" />
                View All Invoices
              </Link>
            </Button>
          </div>
        );
      case 'email-status':
        return (
          <div className="space-y-4">
            <EmailStatusWidget />
            <Button asChild className="w-full">
              <Link href="/email-setup">
                <Mail size={16} className="mr-2" />
                Go to Email Setup
              </Link>
            </Button>
          </div>
        );
      case 'recent-activity':
        return (
          <div className="space-y-4">
            <RecentActivityWidget />
            <Button asChild variant="outline" className="w-full">
              <Link href="/analytics">
                <BarChart3 size={16} className="mr-2" />
                View Analytics
              </Link>
            </Button>
          </div>
        );
      default:
        return renderWidgetContent(widget.type);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Drag and drop widgets to customize your workspace
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Settings size={16} className="mr-2" />
          Customize Layout
        </Button>
      </div>

      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCorners}
      >
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 auto-rows-min">
          <SortableContext items={widgets.map((w) => w.id)} strategy={rectSortingStrategy}>
            {widgets.map((widget) => (
              <SortableWidget
                key={widget.id}
                widget={widget}
                onRemove={handleRemoveWidget}
                onExpand={handleExpandWidget}
              />
            ))}
          </SortableContext>
          
          <div className="col-span-1 md:col-span-2">
            <WidgetSelector onAdd={handleAddWidget} usedTypes={usedTypes} />
          </div>
        </div>

        <DragOverlay>
          {activeWidget ? (
            <Card className={cn("opacity-95", activeWidget.color)}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <activeWidget.icon size={18} className="text-gray-600 dark:text-gray-400" />
                  <CardTitle className="text-sm">{activeWidget.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {renderWidgetContent(activeWidget.type)}
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Widget Expansion Dialog */}
      <Dialog open={!!expandedWidget} onOpenChange={() => setExpandedWidget(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {expandedWidget && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <expandedWidget.icon size={20} />
                  {expandedWidget.title}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                {renderExpandedContent(expandedWidget)}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};