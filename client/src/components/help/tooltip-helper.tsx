import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface TooltipHelperProps {
  children?: ReactNode;
  content: string;
  className?: string;
}

export default function TooltipHelper({ children, content, className = "" }: TooltipHelperProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children || (
            <button className={`inline-flex items-center justify-center text-gray-400 hover:text-gray-600 ${className}`}>
              <HelpCircle className="w-4 h-4" />
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}