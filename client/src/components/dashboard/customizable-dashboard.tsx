import React, { useState, useCallback, useMemo } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import type { DashboardMetrics } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

// Widget types
export type WidgetType = 
  | 'metrics-overview'
  | 'outstanding-invoices' 
  | 'email-status'
  | 'recent-activity'
  | 'quick-actions'
  | 'payment-reminders'
  | 'customer-insights'
  | 'performance-chart';

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
  }
];

// Default dashboard layout
const DEFAULT_WIDGETS: Widget[] = [
  { ...AVAILABLE_WIDGETS[0], id: 'widget-1' },
  { ...AVAILABLE_WIDGETS[1], id: 'widget-2' },
  { ...AVAILABLE_WIDGETS[2], id: 'widget-3' },
  { ...AVAILABLE_WIDGETS[3], id: 'widget-4' }
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
    default:
      return (
        <div className="text-center text-gray-500 py-4">
          Widget content coming soon
        </div>
      );
  }
};

// Sortable widget component
interface SortableWidgetProps {
  widget: Widget;
  onRemove: (id: string) => void;
}

const SortableWidget: React.FC<SortableWidgetProps> = ({ widget, onRemove }) => {
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
      <Card className={cn("h-full transition-all duration-200", widget.color)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon size={18} className="text-gray-600 dark:text-gray-400" />
              <CardTitle className="text-sm">{widget.title}</CardTitle>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                {...attributes}
                {...listeners}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-grab active:cursor-grabbing"
              >
                <GripVertical size={14} className="text-gray-500" />
              </button>
              <button
                onClick={() => onRemove(widget.id)}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
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

  const usedTypes = useMemo(() => widgets.map((w) => w.type), [widgets]);

  const activeWidget = activeId ? widgets.find((w) => w.id === activeId) : null;

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
    </div>
  );
};