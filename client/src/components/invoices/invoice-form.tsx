import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertInvoiceSchema } from "@shared/schema";
import type { Customer } from "@/lib/types";
import { z } from "zod";

const formSchema = insertInvoiceSchema.extend({
  issueDate: z.string(),
  dueDate: z.string(),
});

type FormData = z.infer<typeof formSchema>;

interface InvoiceFormProps {
  onSuccess?: () => void;
  initialData?: Partial<FormData>;
}

export default function InvoiceForm({ onSuccess, initialData }: InvoiceFormProps) {
  const { toast } = useToast();

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      number: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      amount: "",
      description: "",
      customerId: undefined,
      status: "pending",
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      ...initialData,
    },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const invoiceData = {
        ...data,
        issueDate: new Date(data.issueDate),
        dueDate: new Date(data.dueDate),
      };
      const response = await apiRequest("POST", "/api/invoices", invoiceData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Invoice created successfully",
        description: "The invoice has been added to your system.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create invoice",
        description: error.message || "There was an error creating the invoice.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createInvoiceMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice Number</FormLabel>
                <FormControl>
                  <Input placeholder="INV-2024-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="issueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Brief description of services or products" 
                  rows={3} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createInvoiceMutation.isPending}
            className="bg-flow-blue text-white hover:bg-blue-600"
          >
            {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
