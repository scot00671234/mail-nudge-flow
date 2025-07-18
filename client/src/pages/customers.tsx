import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Search, Edit, Trash2, Mail, Phone, MapPin } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCustomerSchema } from "@shared/schema";
import type { Customer } from "@/lib/types";
import { z } from "zod";

type FormData = z.infer<typeof insertCustomerSchema>;

export default function Customers() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/customers", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Customer created successfully",
        description: "The customer has been added to your system.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      handleCloseModal();
    },
    onError: () => {
      toast({
        title: "Failed to create customer",
        description: "There was an error creating the customer.",
        variant: "destructive",
      });
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      const response = await apiRequest("PUT", `/api/customers/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Customer updated successfully",
        description: "The customer information has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      handleCloseModal();
    },
    onError: () => {
      toast({
        title: "Failed to update customer",
        description: "There was an error updating the customer.",
        variant: "destructive",
      });
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/customers/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Customer deleted",
        description: "The customer has been removed from your system.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
    },
    onError: () => {
      toast({
        title: "Failed to delete customer",
        description: "There was an error deleting the customer.",
        variant: "destructive",
      });
    },
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      form.reset({
        name: customer.name,
        email: customer.email,
        phone: customer.phone || "",
        address: customer.address || "",
      });
    } else {
      setEditingCustomer(null);
      form.reset({
        name: "",
        email: "",
        phone: "",
        address: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    form.reset();
  };

  const onSubmit = (data: FormData) => {
    if (editingCustomer) {
      updateCustomerMutation.mutate({ id: editingCustomer.id, data });
    } else {
      createCustomerMutation.mutate(data);
    }
  };

  const handleDeleteCustomer = (id: number) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      deleteCustomerMutation.mutate(id);
    }
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
              <p className="text-sm text-gray-500">Manage your customer contacts and information</p>
            </div>
            <Button 
              onClick={() => handleOpenModal()}
              className="bg-flow-blue text-white hover:bg-blue-600"
            >
              <Plus className="mr-2 w-4 h-4" />
              Add Customer
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">All Customers</h2>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search customers..."
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
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredCustomers.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    {searchTerm 
                      ? "No customers match your search." 
                      : "No customers found. Create your first customer to get started."
                    }
                  </div>
                ) : (
                  filteredCustomers.map((customer) => (
                    <div key={customer.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-flow-blue bg-opacity-10 rounded-full flex items-center justify-center">
                              <span className="text-flow-blue font-semibold text-lg">
                                {customer.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-900">{customer.name}</h3>
                              <div className="mt-1 space-y-1">
                                <div className="flex items-center text-sm text-gray-500">
                                  <Mail className="w-4 h-4 mr-2" />
                                  {customer.email}
                                </div>
                                {customer.phone && (
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Phone className="w-4 h-4 mr-2" />
                                    {customer.phone}
                                  </div>
                                )}
                                {customer.address && (
                                  <div className="flex items-center text-sm text-gray-500">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    {customer.address}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenModal(customer)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCustomer(customer.id)}
                            disabled={deleteCustomerMutation.isPending}
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

      {/* Customer Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? "Edit Customer" : "Add New Customer"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Customer name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="customer@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St, City, State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createCustomerMutation.isPending || updateCustomerMutation.isPending}
                  className="bg-flow-blue text-white hover:bg-blue-600"
                >
                  {createCustomerMutation.isPending || updateCustomerMutation.isPending 
                    ? "Saving..." 
                    : editingCustomer ? "Update Customer" : "Create Customer"
                  }
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
