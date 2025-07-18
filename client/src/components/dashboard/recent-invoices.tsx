import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlaneTakeoff, Eye, Edit, Search, Filter } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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

export default function RecentInvoices() {
  const [searchTerm, setSearchTerm] = useState("");
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

  // Combine invoices with customer data
  const invoicesWithCustomers = invoices.map(invoice => ({
    ...invoice,
    customer: customers.find(c => c.id === invoice.customerId)
  }));

  // Filter invoices based on search term
  const filteredInvoices = invoicesWithCustomers.filter(invoice =>
    invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendNudge = (invoiceId: number) => {
    sendNudgeMutation.mutate(invoiceId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Recent Invoices</h2>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Invoices</h2>
          <div className="flex items-center space-x-3">
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
            <Button variant="ghost" size="sm">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
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
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No invoices found. Create your first invoice to get started.
                  </td>
                </tr>
              ) : (
                filteredInvoices.slice(0, 10).map((invoice) => (
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {filteredInvoices.length > 10 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">10</span> of{" "}
                <span className="font-medium">{filteredInvoices.length}</span> results
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
