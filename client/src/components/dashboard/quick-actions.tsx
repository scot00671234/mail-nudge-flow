import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Upload, Plus, PlaneTakeoff, Mail, ChevronRight } from "lucide-react";

interface QuickActionsProps {
  onUploadInvoice: () => void;
  onCreateInvoice: () => void;
}

export default function QuickActions({ onUploadInvoice, onCreateInvoice }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
      </CardHeader>
      <CardContent className="space-y-3">
        <button
          onClick={onUploadInvoice}
          className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <div className="w-8 h-8 bg-flow-blue bg-opacity-10 rounded-lg flex items-center justify-center mr-3">
              <Upload className="text-flow-blue w-4 h-4" />
            </div>
            <span className="font-medium text-gray-900">Upload Invoice</span>
          </div>
          <ChevronRight className="text-gray-400 w-4 h-4" />
        </button>
        
        <button
          onClick={onCreateInvoice}
          className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <div className="w-8 h-8 bg-flow-success bg-opacity-10 rounded-lg flex items-center justify-center mr-3">
              <Plus className="text-flow-success w-4 h-4" />
            </div>
            <span className="font-medium text-gray-900">Create Invoice</span>
          </div>
          <ChevronRight className="text-gray-400 w-4 h-4" />
        </button>
        
        <button
          className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <PlaneTakeoff className="text-purple-600 w-4 h-4" />
            </div>
            <span className="font-medium text-gray-900">Send Bulk Nudges</span>
          </div>
          <ChevronRight className="text-gray-400 w-4 h-4" />
        </button>
        
        <button
          className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <div className="w-8 h-8 bg-flow-warning bg-opacity-10 rounded-lg flex items-center justify-center mr-3">
              <Mail className="text-flow-warning w-4 h-4" />
            </div>
            <span className="font-medium text-gray-900">Manage Templates</span>
          </div>
          <ChevronRight className="text-gray-400 w-4 h-4" />
        </button>
      </CardContent>
    </Card>
  );
}
