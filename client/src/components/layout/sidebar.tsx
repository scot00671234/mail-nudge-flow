import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  FileText, 
  Users, 
  Mail, 
  Settings, 
  PieChart,
  PlaneTakeoff
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Email Templates", href: "/email-templates", icon: Mail },
  { name: "Nudge Settings", href: "/nudge-settings", icon: Settings },
  { name: "Analytics", href: "/analytics", icon: PieChart },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-flow-blue rounded-lg flex items-center justify-center">
              <PlaneTakeoff className="text-white w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Flow</h1>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="mt-8 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    isActive
                      ? "bg-flow-blue text-white"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                  )}
                >
                  <item.icon className="mr-3 w-4 h-4" />
                  {item.name}
                </a>
              </Link>
            );
          })}
        </nav>
        
        {/* User Profile */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <Users className="text-gray-600 w-4 h-4" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">John Smith</p>
              <p className="text-xs text-gray-500">john@company.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
