import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Plus, TrendingUp, DollarSign, Mail, Clock, Users, FileText, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useOnboarding } from '@/components/onboarding/onboarding-provider';
import { OnboardingChecklist } from '@/components/onboarding/onboarding-checklist';
import { WelcomeModal } from '@/components/onboarding/welcome-modal';
import { GuidedTooltip } from '@/components/onboarding/guided-tooltip';
import { EmptyStatePrompt } from '@/components/onboarding/empty-state-prompt';
import { SuccessCelebration } from '@/components/onboarding/success-celebration';
import { ContextualHelp } from '@/components/onboarding/contextual-help';
import UploadModal from '@/components/invoices/upload-modal';
import type { DashboardMetrics } from '@/lib/types';

export default function Dashboard() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentTooltip, setCurrentTooltip] = useState<string | null>(null);

  const { 
    isOnboardingActive, 
    currentStep, 
    completeStep,
    showTour,
    setShowTour 
  } = useOnboarding();

  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { data: invoices } = useQuery({
    queryKey: ["/api/invoices"],
  });

  const { data: customers } = useQuery({
    queryKey: ["/api/customers"],
  });

  const { data: activities } = useQuery({
    queryKey: ["/api/activities"],
  });

  // Show welcome modal for new users
  useEffect(() => {
    if (isOnboardingActive && showTour) {
      setShowWelcomeModal(true);
      setShowTour(false);
    }
  }, [isOnboardingActive, showTour, setShowTour]);

  // Handle guided tooltips
  useEffect(() => {
    if (currentStep === 'create-first-invoice' && !showWelcomeModal) {
      setCurrentTooltip('create-first-invoice');
    } else {
      setCurrentTooltip(null);
    }
  }, [currentStep, showWelcomeModal]);

  // Check if user completed first invoice
  useEffect(() => {
    if (invoices && invoices.length > 0 && currentStep === 'create-first-invoice') {
      completeStep('create-first-invoice');
      setShowSuccessModal(true);
    }
  }, [invoices, currentStep, completeStep]);

  // Check if user added first customer
  useEffect(() => {
    if (customers && customers.length > 0 && currentStep === 'add-customer') {
      completeStep('add-customer');
      setShowSuccessModal(true);
    }
  }, [customers, currentStep, completeStep]);

  const handleCreateInvoice = () => {
    setIsUploadModalOpen(true);
  };

  const handleNavigateToInvoices = () => {
    window.location.href = '/invoices';
  };

  const handleNavigateToCustomers = () => {
    window.location.href = '/customers';
  };

  const handleSuccessContinue = () => {
    setShowSuccessModal(false);
  };

  const hasNoData = !invoices?.length && !customers?.length;

  return (
    <>
      <PageHeader 
        title="Overview" 
        description="See how your invoices are doing"
      >
        <div className="flex items-center space-x-3">
          <Button 
            onClick={handleCreateInvoice}
            className="bg-black hover:bg-gray-800 text-white"
            id="new-invoice-button"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </PageHeader>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-8 py-6 bg-background">
        {/* Onboarding Checklist */}
        <OnboardingChecklist />
        
        {/* Contextual Help */}
        <ContextualHelp section="dashboard" />

        {/* Show empty state for new users or metrics for existing users */}
        {hasNoData && isOnboardingActive ? (
          <div className="space-y-6">
            {/* Welcome State - First Invoice */}
            <EmptyStatePrompt
              icon={<FileText className="h-8 w-8 text-primary" />}
              title="Create your first invoice"
              description="Start by creating an invoice to send to your customers. You'll be able to track payments and send automated reminders."
              primaryAction={{
                label: "Create Invoice",
                onClick: handleCreateInvoice
              }}
              secondaryAction={{
                label: "Add Customer First",
                onClick: handleNavigateToCustomers
              }}
              highlight={currentStep === 'create-first-invoice'}
            />
          </div>
        ) : (
          <>
            {/* Metrics Cards */}
            {metricsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-2">
                      <div className="h-4 bg-muted rounded w-24"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-20"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      OUTSTANDING INVOICES
                    </CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics?.outstandingInvoices || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(metrics?.outstandingValue || 0)} total value
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      RESPONSE RATE
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics?.responseRate || 0}%</div>
                    <p className="text-xs text-muted-foreground">This month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      REMINDERS SENT
                    </CardTitle>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics?.nudgesSent || 0}</div>
                    <p className="text-xs text-muted-foreground">This month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      AVG. COLLECTION TIME
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics?.avgCollectionTime || 0}</div>
                    <p className="text-xs text-muted-foreground">days</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Email Connection Banner */}
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg text-blue-900">Connect your email</CardTitle>
                      <CardDescription className="text-blue-700">
                        Required to send payment reminders
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                    Connect Email
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {activities && activities.length > 0 ? (
                    <div className="space-y-4">
                      {activities.slice(0, 5).map((activity: any) => (
                        <div key={activity.id} className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                          <div className="flex-1">
                            <p className="text-sm">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No recent activity
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={handleCreateInvoice}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Invoice
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/customers">
                      <Users className="h-4 w-4 mr-2" />
                      Add Customer
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/email-setup">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Setup
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>

      {/* Modals and Tooltips */}
      <WelcomeModal 
        open={showWelcomeModal} 
        onClose={() => setShowWelcomeModal(false)} 
      />

      <GuidedTooltip
        isVisible={currentTooltip === 'create-first-invoice'}
        title="Start here!"
        description="Click this button to create your first invoice. This is the fastest way to get started with Flow."
        targetSelector="#new-invoice-button"
        onNext={() => setCurrentTooltip(null)}
        onSkip={() => setCurrentTooltip(null)}
        position="bottom"
      />

      <SuccessCelebration
        isVisible={showSuccessModal}
        title="Great job!"
        description="You've taken your first step towards getting paid faster. Keep going to unlock more features."
        onContinue={handleSuccessContinue}
      />

      <UploadModal 
        open={isUploadModalOpen} 
        onOpenChange={setIsUploadModalOpen} 
      />
    </>
  );
}