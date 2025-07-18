import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Edit, Trash2, Eye, Mail } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEmailTemplateSchema } from "@shared/schema";
import type { EmailTemplate } from "@/lib/types";
import { z } from "zod";

type FormData = z.infer<typeof insertEmailTemplateSchema>;

const templateTypes = [
  { value: "first_reminder", label: "First Reminder" },
  { value: "second_reminder", label: "Second Reminder" },
  { value: "final_notice", label: "Final Notice" },
];

const mergeFields = [
  "{{customerName}}",
  "{{invoiceNumber}}",
  "{{amount}}",
  "{{dueDate}}",
  "{{issueDate}}",
  "{{description}}",
  "{{companyName}}",
];

export default function EmailTemplates() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const { toast } = useToast();

  const { data: templates = [], isLoading } = useQuery<EmailTemplate[]>({
    queryKey: ["/api/email-templates"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(insertEmailTemplateSchema),
    defaultValues: {
      name: "",
      type: "first_reminder",
      subject: "",
      body: "",
      isActive: true,
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/email-templates", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Template created successfully",
        description: "The email template has been added to your system.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
      handleCloseModal();
    },
    onError: () => {
      toast({
        title: "Failed to create template",
        description: "There was an error creating the email template.",
        variant: "destructive",
      });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      const response = await apiRequest("PUT", `/api/email-templates/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Template updated successfully",
        description: "The email template has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
      handleCloseModal();
    },
    onError: () => {
      toast({
        title: "Failed to update template",
        description: "There was an error updating the email template.",
        variant: "destructive",
      });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/email-templates/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Template deleted",
        description: "The email template has been removed from your system.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
    },
    onError: () => {
      toast({
        title: "Failed to delete template",
        description: "There was an error deleting the email template.",
        variant: "destructive",
      });
    },
  });

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (template?: EmailTemplate) => {
    if (template) {
      setEditingTemplate(template);
      form.reset({
        name: template.name,
        type: template.type,
        subject: template.subject,
        body: template.body,
        isActive: template.isActive ?? true,
      });
    } else {
      setEditingTemplate(null);
      form.reset({
        name: "",
        type: "first_reminder",
        subject: "",
        body: "",
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
    form.reset();
  };

  const onSubmit = (data: FormData) => {
    if (editingTemplate) {
      updateTemplateMutation.mutate({ id: editingTemplate.id, data });
    } else {
      createTemplateMutation.mutate(data);
    }
  };

  const handleDeleteTemplate = (id: number) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteTemplateMutation.mutate(id);
    }
  };

  const insertMergeField = (field: string) => {
    const bodyValue = form.getValues("body");
    const textarea = document.querySelector('textarea[name="body"]') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = bodyValue.slice(0, start) + field + bodyValue.slice(end);
      form.setValue("body", newValue);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + field.length, start + field.length);
      }, 0);
    }
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
              <p className="text-sm text-gray-500">Manage automated email templates for invoice nudges</p>
            </div>
            <Button 
              onClick={() => handleOpenModal()}
              className="bg-flow-blue text-white hover:bg-blue-600"
            >
              <Plus className="mr-2 w-4 h-4" />
              Add Template
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">All Templates</h2>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredTemplates.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    {searchTerm 
                      ? "No templates match your search." 
                      : "No email templates found. Create your first template to get started."
                    }
                  </div>
                ) : (
                  filteredTemplates.map((template) => (
                    <div key={template.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-flow-blue bg-opacity-10 rounded-lg flex items-center justify-center">
                              <Mail className="text-flow-blue w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                                <Badge 
                                  variant={template.isActive ? "default" : "secondary"}
                                  className={template.isActive ? "bg-flow-success text-white" : ""}
                                >
                                  {template.isActive ? "Active" : "Inactive"}
                                </Badge>
                                <Badge variant="outline">
                                  {templateTypes.find(t => t.value === template.type)?.label || template.type}
                                </Badge>
                              </div>
                              <div className="mt-1">
                                <p className="text-sm font-medium text-gray-700">{template.subject}</p>
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                  {template.body.slice(0, 150)}...
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewTemplate(template)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenModal(template)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTemplate(template.id)}
                            disabled={deleteTemplateMutation.isPending}
                            className="text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Template Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Email Template" : "Create New Email Template"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First Reminder Template" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select template type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {templateTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Payment Reminder: Invoice {{invoiceNumber}}" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Body</FormLabel>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <span className="text-sm text-gray-600">Merge fields:</span>
                        {mergeFields.map((mergeField) => (
                          <Button
                            key={mergeField}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => insertMergeField(mergeField)}
                            className="text-xs h-7"
                          >
                            {mergeField}
                          </Button>
                        ))}
                      </div>
                      <FormControl>
                        <Textarea 
                          placeholder="Dear {{customerName}},&#10;&#10;This is a friendly reminder that invoice {{invoiceNumber}} for ${{amount}} is now due..."
                          rows={8}
                          {...field} 
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Template</FormLabel>
                      <div className="text-sm text-gray-500">
                        Enable this template for automated nudges
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
                  className="bg-flow-blue text-white hover:bg-blue-600"
                >
                  {createTemplateMutation.isPending || updateTemplateMutation.isPending 
                    ? "Saving..." 
                    : editingTemplate ? "Update Template" : "Create Template"
                  }
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      {previewTemplate && (
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Preview: {previewTemplate.name}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Subject:</h4>
                <p className="text-sm bg-gray-50 p-3 rounded">{previewTemplate.subject}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Body:</h4>
                <div className="text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">
                  {previewTemplate.body}
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                <p>Note: Merge fields like {{customerName}} will be replaced with actual values when the email is sent.</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
