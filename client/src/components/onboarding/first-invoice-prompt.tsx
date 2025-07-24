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
    <div className="bg-card border border-border/50 rounded-xl p-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Add your first invoice</h3>
        <p className="text-sm text-muted-foreground">Choose how you'd like to get started</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <Button
          onClick={onUploadInvoice}
          variant="outline"
          className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-muted/50 border-border/50"
        >
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Upload className="w-5 h-5 text-primary" />
          </div>
          <div className="text-center">
            <div className="text-sm font-medium">Upload File</div>
            <div className="text-xs text-muted-foreground mt-1">
              PDF, Excel, or Word document
            </div>
          </div>
        </Button>
        
        <Button
          onClick={onCreateInvoice}
          variant="outline"
          className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-muted/50 border-border/50"
        >
          <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
            <Plus className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-center">
            <div className="text-sm font-medium">Create New</div>
            <div className="text-xs text-muted-foreground mt-1">
              Fill out a simple form
            </div>
          </div>
        </Button>
      </div>
      
      <div className="text-center">
        <Button variant="ghost" size="sm" onClick={onDismiss} className="text-xs text-muted-foreground">
          I'll do this later
        </Button>
      </div>
    </div>
  );
}