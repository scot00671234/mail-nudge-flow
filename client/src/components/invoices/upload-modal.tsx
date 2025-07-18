import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import InvoiceForm from "./invoice-form";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [uploadMethod, setUploadMethod] = useState<"upload" | "manual">("upload");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Here you would handle file upload logic
      console.log("Files selected:", files);
      // For now, just switch to manual entry
      setUploadMethod("manual");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Here you would handle file drop logic
      console.log("Files dropped:", files);
      // For now, just switch to manual entry
      setUploadMethod("manual");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Upload Invoice
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {uploadMethod === "upload" ? (
            <>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-flow-blue transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <div className="w-16 h-16 bg-flow-blue bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="text-flow-blue w-6 h-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Drop your invoice here</h3>
                <p className="text-gray-500 mb-4">Or click to browse and select files</p>
                <Button className="bg-flow-blue text-white hover:bg-blue-600">
                  Browse Files
                </Button>
                <p className="text-xs text-gray-400 mt-3">Supports PDF, DOC, DOCX, PNG, JPG (Max 10MB)</p>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              
              <div className="text-center">
                <p className="text-gray-500 mb-2">Or</p>
                <Button
                  variant="outline"
                  onClick={() => setUploadMethod("manual")}
                >
                  Create Manually
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Create Invoice Manually</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUploadMethod("upload")}
                  className="text-flow-blue hover:text-blue-700"
                >
                  ← Back to Upload
                </Button>
              </div>
              <InvoiceForm onSuccess={onClose} />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
