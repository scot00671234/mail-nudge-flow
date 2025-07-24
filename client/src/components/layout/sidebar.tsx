import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  FileText, 
  Users, 
  Mail, 
  Settings, 
  PieChart,
  PlaneTakeoff,
  User,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: BarChart3 },
  { name: "My Invoices", href: "/invoices", icon: FileText },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Email Setup", href: "/email-setup", icon: Mail },
  { name: "Reminder Messages", href: "/email-templates", icon: Mail },
  { name: "Reminder Settings", href: "/nudge-settings", icon: Settings },
  { name: "Reports", href: "/analytics", icon: PieChart },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  return (
    <div className="hidden md:flex md:w-60 md:flex-col">
      <div className="flex flex-col h-full bg-background border-r border-border/50">
        {/* Logo */}
        <div className="flex items-center px-6 py-8">
          <img src="/logo.svg" alt="Flow Logo" className="h-7" />
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <span
                  className={cn(
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer"
                  )}
                >
                  <item.icon className="mr-3 w-4 h-4" />
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
        
        {/* User Profile */}
        <div className="px-4 py-6 border-t border-border/50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-0 h-auto rounded-xl">
                <div className="flex items-center w-full p-3">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <User className="text-muted-foreground w-5 h-5" />
                  </div>
                  <div className="ml-3 text-left flex-1">
                    <p className="text-sm font-medium text-gray-700">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : user?.email || "User"
                      }
                    </p>
                    <p className="text-xs text-gray-500">{user?.email || ""}</p>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="cursor-pointer" onClick={() => window.location.href = '/account'}>
                <User className="mr-2 h-4 w-4" />
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-red-600"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
