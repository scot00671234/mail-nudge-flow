import { BarChart3, FileText, Mail, Settings, Users, CreditCard, Home, MessageSquare } from "lucide-react";
import { useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import type { WidgetType } from "@/components/dashboard/customizable-dashboard";

const menuItems = [
  {
    title: "Overview",
    url: "/",
    icon: Home,
    widgetType: null,
  },
  {
    title: "Invoices",
    url: "/invoices",
    icon: FileText,
    widgetType: "outstanding-invoices" as WidgetType,
  },
  {
    title: "Customers",
    url: "/customers", 
    icon: Users,
    widgetType: "customer-insights" as WidgetType,
  },
  {
    title: "Email Setup",
    url: "/email-setup",
    icon: Mail,
    widgetType: "email-flow-setup" as WidgetType,
  },
];

// Import widget components
import { EmailFlowWidget } from "@/components/dashboard/email-flow-widget";

// Widget content components for sidebar pop-ups
const InvoicesWidget = () => {
  return (
    <div className="space-y-6">
      <div className="text-center p-6 bg-orange-50 dark:bg-orange-950 rounded-lg">
        <FileText size={48} className="mx-auto mb-4 text-orange-600" />
        <h3 className="text-lg font-semibold mb-2">Invoice Management</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Create, track, and manage all your invoices in one place
        </p>
        <Button asChild className="w-full">
          <Link href="/invoices">Go to Invoices</Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 border rounded-lg">
          <div className="text-2xl font-bold text-blue-600 mb-1">0</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Draft</div>
        </div>
        <div className="text-center p-4 border rounded-lg">
          <div className="text-2xl font-bold text-orange-600 mb-1">0</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
        </div>
        <div className="text-center p-4 border rounded-lg">
          <div className="text-2xl font-bold text-green-600 mb-1">0</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Paid</div>
        </div>
        <div className="text-center p-4 border rounded-lg">
          <div className="text-2xl font-bold text-red-600 mb-1">0</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Overdue</div>
        </div>
      </div>
    </div>
  );
};

const CustomersWidget = () => {
  return (
    <div className="space-y-6">
      <div className="text-center p-6 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <Users size={48} className="mx-auto mb-4 text-blue-600" />
        <h3 className="text-lg font-semibold mb-2">Customer Management</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Manage your customer database and relationships
        </p>
        <Button asChild className="w-full">
          <Link href="/customers">Go to Customers</Link>
        </Button>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 border rounded-lg">
          <span className="text-sm">Total Customers</span>
          <span className="font-semibold">0</span>
        </div>
        <div className="flex justify-between items-center p-3 border rounded-lg">
          <span className="text-sm">Active This Month</span>
          <span className="font-semibold">0</span>
        </div>
        <div className="flex justify-between items-center p-3 border rounded-lg">
          <span className="text-sm">New This Week</span>
          <span className="font-semibold">0</span>
        </div>
      </div>
    </div>
  );
};

export default function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [openWidget, setOpenWidget] = useState<WidgetType | null>(null);

  const handleMenuClick = (item: typeof menuItems[0]) => {
    if (item.widgetType && location === "/") {
      // If on dashboard, open widget popup
      setOpenWidget(item.widgetType);
    } else {
      // Otherwise navigate to the page
      window.location.href = item.url;
    }
  };

  const renderWidgetContent = (widgetType: WidgetType) => {
    switch (widgetType) {
      case "outstanding-invoices":
        return <InvoicesWidget />;
      case "customer-insights":
        return <CustomersWidget />;
      case "email-flow-setup":
        return <EmailFlowWidget />;
      default:
        return <div>Widget content coming soon</div>;
    }
  };

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileText className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Flow</span>
            <span className="truncate text-xs">Invoice Management</span>
          </div>
          <SidebarTrigger className="-mr-1" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => handleMenuClick(item)}
                    isActive={location === item.url}
                    className="cursor-pointer"
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user?.firstName} {user?.lastName}</span>
                <span className="truncate text-xs">{user?.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="ml-auto"
              >
                Sign out
              </Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* Widget Dialog */}
      <Dialog open={!!openWidget} onOpenChange={() => setOpenWidget(null)}>
        <DialogContent className="max-w-2xl glass-card border-0 animate-in">
          {openWidget && (
            <>
              <DialogHeader className="space-y-3">
                <DialogTitle className="flex items-center gap-3 text-xl">
                  {(() => {
                    const menuItem = menuItems.find(item => item.widgetType === openWidget);
                    if (menuItem) {
                      const IconComponent = menuItem.icon;
                      return (
                        <>
                          <IconComponent size={24} className="text-primary" />
                          {menuItem.title}
                        </>
                      );
                    }
                    return null;
                  })()}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-6">
                {renderWidgetContent(openWidget)}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}