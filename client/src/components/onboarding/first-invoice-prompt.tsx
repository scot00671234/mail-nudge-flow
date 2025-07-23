import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Plus, ArrowRight } from "lucide-react";

interface FirstInvoicePromptProps {
  onUploadInvoice: () => void;
  onCreateInvoice: () => void;
  onDismiss: () => void;
}

export default function FirstInvoicePrompt({ onUploadInvoice, onCreateInvoice, onDismiss }: FirstInvoicePromptProps) {
  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Ready to add your first invoice?</CardTitle>
        <CardDescription>
          Let's get started! Choose the easiest way for you:
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={onUploadInvoice}
            variant="outline"
            className="h-auto p-6 flex flex-col items-center space-y-3 hover:bg-primary/5 border-2"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-center">
              <div className="font-medium">Upload a File</div>
              <div className="text-sm text-gray-500 mt-1">
                Drop in a PDF, Excel, or Word document
              </div>
            </div>
          </Button>
          
          <Button
            onClick={onCreateInvoice}
            variant="outline"
            className="h-auto p-6 flex flex-col items-center space-y-3 hover:bg-primary/5 border-2"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Plus className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-center">
              <div className="font-medium">Create New Invoice</div>
              <div className="text-sm text-gray-500 mt-1">
                Fill out a simple form with details
              </div>
            </div>
          </Button>
        </div>
        
        <div className="text-center">
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            I'll do this later
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}