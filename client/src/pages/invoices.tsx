import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, PlaneTakeoff, Eye, Edit, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import UploadModal from "@/components/invoices/upload-modal";
import type { InvoiceWithCustomer, Customer } from "@/lib/types";

function getStatusColor(status: string) {
  switch (status) {
    case "paid":
      return "bg-flow-success bg-opacity-10 text-flow-success";
    case "overdue":
      return "bg-flow-danger bg-opacity-10 text-flow-danger";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function Invoices() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const { data: invoices = [], isLoading } = useQuery<InvoiceWithCustomer[]>({
    queryKey: ["/api/invoices"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const sendNudgeMutation = useMutation({
    mutationFn: async (invoiceId: number) => {
      const response = await apiRequest("POST", `/api/invoices/${invoiceId}/nudge`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Nudge sent successfully",
        description: "The payment reminder has been sent to the customer.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
    },
    onError: () => {
      toast({
        title: "Failed to send nudge",
        description: "There was an error sending the payment reminder.",
        variant: "destructive",
      });
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: number) => {
      await apiRequest("DELETE", `/api/invoices/${invoiceId}`);
    },
    onSuccess: () => {
      toast({
        title: "Invoice deleted",
        description: "The invoice has been removed from your system.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
    },
    onError: () => {
      toast({
        title: "Failed to delete invoice",
        description: "There was an error deleting the invoice.",
        variant: "destructive",
      });
    },
  });

  // Combine invoices with customer data
  const invoicesWithCustomers = invoices.map(invoice => ({
    ...invoice,
    customer: customers.find(c => c.id === invoice.customerId)
  }));

  // Filter invoices
  const filteredInvoices = invoicesWithCustomers.filter(invoice => {
    const matchesSearch = 
      invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSendNudge = (invoiceId: number) => {
    sendNudgeMutation.mutate(invoiceId);
  };

  const handleDeleteInvoice = (invoiceId: number) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      deleteInvoiceMutation.mutate(invoiceId);
    }
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
              <p className="text-sm text-gray-500">Manage your invoices and payment tracking</p>
            </div>
            <Button 
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-flow-blue text-white hover:bg-blue-600"
            >
              <Plus className="mr-2 w-4 h-4" />
              Add Invoice
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">All Invoices</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="viewed">Viewed</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="sm">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Issue Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                          {searchTerm || statusFilter !== "all" 
                            ? "No invoices match your filters." 
                            : "No invoices found. Create your first invoice to get started."
                          }
                        </td>
                      </tr>
                    ) : (
                      filteredInvoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{invoice.number}</div>
                            <div className="text-sm text-gray-500">{invoice.description || "—"}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {invoice.customer?.name || "Unknown Customer"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {invoice.customer?.email || "—"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${parseFloat(invoice.amount).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusColor(invoice.status)}>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(invoice.issueDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSendNudge(invoice.id)}
                              disabled={invoice.status === "paid" || sendNudgeMutation.isPending}
                              className="text-flow-blue hover:text-blue-700"
                            >
                              <PlaneTakeoff className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteInvoice(invoice.id)}
                              disabled={deleteInvoiceMutation.isPending}
                              className="text-red-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />
    </>
  );
}
