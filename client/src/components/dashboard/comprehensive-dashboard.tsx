import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Users, 
  Mail, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  Plus,
  Send,
  Settings,
  BarChart3,
  Activity,
  ExternalLink,
  LogOut,
  User,
  CheckCircle,
  XCircle,
  Eye,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import type { DashboardMetrics } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { EmailFlowWidget } from './email-flow-widget';
import { useAuth } from '@/hooks/use-auth';
import { Link } from 'wouter';

// Types
interface Invoice {
  id: number;
  customerName: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'sent' | 'viewed' | 'paid' | 'overdue';
  description: string;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  totalInvoices: number;
  outstandingAmount: number;
}

// Header Component
const DashboardHeader = () => {
  const { user, logout } = useAuth();
  
  return (
    <div className="glass-card border-0 mb-8 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Flow Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Complete invoice management and payment reminder system
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              {user?.firstName?.[0] || user?.email?.[0] || "U"}
            </div>
            <div>
              <p className="text-sm font-medium">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email
                }
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={logout} className="glass-card border-0">
            <LogOut size={16} className="mr-2" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
};

// Quick Stats Component
const QuickStats = () => {
  const { data: metrics } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  const stats = [
    {
      title: "Outstanding Invoices",
      value: metrics?.outstandingInvoices || 0,
      subValue: formatCurrency(metrics?.outstandingValue || 0),
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950"
    },
    {
      title: "Response Rate",
      value: `${metrics?.responseRate || 0}%`,
      subValue: "This month",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950"
    },
    {
      title: "Reminders Sent",
      value: metrics?.remindersSent || 0,
      subValue: "This month",
      icon: Mail,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950"
    },
    {
      title: "Avg Collection",
      value: `${metrics?.avgCollectionTime || 0}`,
      subValue: "days",
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <Card key={stat.title} className="glass-card border-0 hover-lift animate-in">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className={cn("text-sm", stat.color)}>{stat.subValue}</p>
              </div>
              <div className={cn("p-3 rounded-lg", stat.bgColor)}>
                <stat.icon size={24} className={stat.color} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Recent Invoices Component
const RecentInvoices = ({ onCreateInvoice }: { onCreateInvoice: () => void }) => {
  const { data: invoices } = useQuery({
    queryKey: ["/api/invoices"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'sent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <Card className="glass-card border-0 hover-lift animate-in">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Recent Invoices</CardTitle>
          <Button onClick={onCreateInvoice} size="sm" className="hover-lift">
            <Plus size={16} className="mr-2" />
            Create Invoice
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!invoices || invoices.length === 0 ? (
          <div className="text-center py-8">
            <FileText size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No invoices yet</p>
            <Button onClick={onCreateInvoice}>
              <Plus size={16} className="mr-2" />
              Create Your First Invoice
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.slice(0, 5).map((invoice: any) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{invoice.customerName}</p>
                    <p className="text-sm text-muted-foreground">{invoice.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(invoice.amount)}</p>
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Customers Overview Component
const CustomersOverview = ({ onAddCustomer }: { onAddCustomer: () => void }) => {
  const { data: customers } = useQuery({
    queryKey: ["/api/customers"],
  });

  return (
    <Card className="glass-card border-0 hover-lift animate-in">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Customers</CardTitle>
          <Button onClick={onAddCustomer} variant="outline" size="sm" className="hover-lift">
            <Plus size={16} className="mr-2" />
            Add Customer
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!customers || customers.length === 0 ? (
          <div className="text-center py-8">
            <Users size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No customers yet</p>
            <Button onClick={onAddCustomer} variant="outline">
              <Plus size={16} className="mr-2" />
              Add Your First Customer
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {customers.slice(0, 5).map((customer: any) => (
              <div key={customer.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <User size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{customer.totalInvoices} invoices</p>
                  <p className="font-semibold">{formatCurrency(customer.outstandingAmount)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Email Status Component
const EmailStatus = ({ onSetupEmail }: { onSetupEmail: () => void }) => {
  const { data: connections } = useQuery({
    queryKey: ["/api/email/connections"],
  });

  const isConnected = connections && connections.length > 0;

  return (
    <Card className="glass-card border-0 hover-lift animate-in">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <Mail size={20} />
          Email Connection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-6">
          {isConnected ? (
            <>
              <CheckCircle size={48} className="mx-auto mb-4 text-green-600" />
              <p className="font-medium text-green-600 mb-2">Connected</p>
              <p className="text-sm text-muted-foreground mb-4">
                Your email is connected and ready to send reminders
              </p>
              <Button onClick={onSetupEmail} variant="outline" size="sm">
                <Settings size={16} className="mr-2" />
                Manage Connection
              </Button>
            </>
          ) : (
            <>
              <XCircle size={48} className="mx-auto mb-4 text-red-600" />
              <p className="font-medium text-red-600 mb-2">Not Connected</p>
              <p className="text-sm text-muted-foreground mb-4">
                Connect your email to send payment reminders
              </p>
              <Button onClick={onSetupEmail}>
                <Mail size={16} className="mr-2" />
                Connect Email
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Main Dashboard Component
export const ComprehensiveDashboard = () => {
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  const closeDialog = () => setActiveDialog(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <DashboardHeader />
        <QuickStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <RecentInvoices onCreateInvoice={() => setActiveDialog('create-invoice')} />
            <EmailStatus onSetupEmail={() => setActiveDialog('email-setup')} />
          </div>
          
          <div className="space-y-8">
            <CustomersOverview onAddCustomer={() => setActiveDialog('add-customer')} />
            
            <Card className="glass-card border-0 hover-lift animate-in">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Email Flow Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <EmailFlowWidget />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <InvoiceDialog 
        open={activeDialog === 'create-invoice'} 
        onClose={closeDialog} 
      />
      <CustomerDialog 
        open={activeDialog === 'add-customer'} 
        onClose={closeDialog} 
      />
      <EmailSetupDialog 
        open={activeDialog === 'email-setup'} 
        onClose={closeDialog} 
      />
    </div>
  );
};

// Dialog Components
const InvoiceDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    amount: '',
    description: '',
    dueDate: ''
  });

  const createInvoice = useMutation({
    mutationFn: (data: any) => apiRequest('/api/invoices', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
      onClose();
      setFormData({ customerName: '', email: '', amount: '', description: '', dueDate: '' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInvoice.mutate({
      ...formData,
      amount: parseFloat(formData.amount),
      status: 'pending'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md glass-card border-0 animate-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText size={20} />
            Create Invoice
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name</Label>
            <Input 
              id="customerName"
              value={formData.customerName}
              onChange={(e) => setFormData({...formData, customerName: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input 
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input 
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              required
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={createInvoice.isPending} className="flex-1">
              {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const CustomerDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const createCustomer = useMutation({
    mutationFn: (data: any) => apiRequest('/api/customers', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      onClose();
      setFormData({ name: '', email: '', phone: '', address: '' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCustomer.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md glass-card border-0 animate-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users size={20} />
            Add Customer
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input 
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address (optional)</Label>
            <Textarea 
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={createCustomer.isPending} className="flex-1">
              {createCustomer.isPending ? 'Adding...' : 'Add Customer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const EmailSetupDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl glass-card border-0 animate-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail size={20} />
            Email Setup
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <EmailFlowWidget />
        </div>
      </DialogContent>
    </Dialog>
  );
};