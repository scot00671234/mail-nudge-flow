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
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Email Templates", href: "/email-templates", icon: Mail },
  { name: "Nudge Settings", href: "/nudge-settings", icon: Settings },
  { name: "Analytics", href: "/analytics", icon: PieChart },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  return (
    <div className="hidden md:flex md:w-72 md:flex-col">
      <div className="flex flex-col flex-grow pt-8 pb-4 overflow-y-auto bg-background border-r border-border/40">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-semibold text-lg">F</span>
            </div>
            <h1 className="text-2xl font-medium tracking-tight text-foreground">Flow</h1>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="mt-12 flex-1 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <span
                  className={cn(
                    isActive
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground border-transparent",
                    "group flex items-center px-4 py-3 text-sm font-medium rounded-xl border transition-all duration-200 cursor-pointer"
                  )}
                >
                  <item.icon className="mr-3 w-5 h-5" />
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
        
        {/* User Profile */}
        <div className="flex-shrink-0 px-4 py-6 border-t border-border/40">
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
                        : user?.username || "User"
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
