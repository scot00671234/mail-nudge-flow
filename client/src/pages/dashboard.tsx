import React, { useState, useEffect } from 'react';
import { CustomizableDashboard } from '@/components/dashboard/customizable-dashboard';
import { useOnboarding } from '@/components/onboarding/onboarding-provider';
import { OnboardingChecklist } from '@/components/onboarding/onboarding-checklist';
import { WelcomeModal } from '@/components/onboarding/welcome-modal';
import { SuccessCelebration } from '@/components/onboarding/success-celebration';

export default function Dashboard() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { 
    isOnboardingActive, 
    currentStep, 
    completeStep,
    showTour,
    setShowTour 
  } = useOnboarding();

  // Show welcome modal for new users
  useEffect(() => {
    if (isOnboardingActive && showTour) {
      setShowWelcomeModal(true);
      setShowTour(false);
    }
  }, [isOnboardingActive, showTour, setShowTour]);

  const handleSuccessContinue = () => {
    setShowSuccessModal(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Onboarding Components */}
      <OnboardingChecklist />
      
      {/* Main Dashboard */}
      <div className="container mx-auto px-4 py-6">
        <CustomizableDashboard />
      </div>

      {/* Modals */}
      <WelcomeModal 
        open={showWelcomeModal} 
        onClose={() => setShowWelcomeModal(false)} 
      />

      <SuccessCelebration
        isVisible={showSuccessModal}
        title="Great job!"
        description="You've taken your first step towards getting paid faster. Keep going to unlock more features."
        onContinue={handleSuccessContinue}
      />
    </div>
  );
}