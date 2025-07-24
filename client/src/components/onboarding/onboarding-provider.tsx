import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  optional?: boolean;
}

interface OnboardingContextType {
  isOnboardingActive: boolean;
  currentStep: string | null;
  steps: OnboardingStep[];
  completeStep: (stepId: string) => void;
  startOnboarding: () => void;
  skipOnboarding: () => void;
  showTour: boolean;
  setShowTour: (show: boolean) => void;
  onboardingProgress: number;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'create-first-invoice',
    title: 'Create your first invoice',
    description: 'Add invoice details and send it to a customer',
    completed: false,
  },
  {
    id: 'add-customer',
    title: 'Add a customer',
    description: 'Save customer details for faster invoicing',
    completed: false,
  },
  {
    id: 'connect-email',
    title: 'Connect your email',
    description: 'Send professional invoices directly from your email',
    completed: false,
    optional: true,
  },
  {
    id: 'customize-templates',
    title: 'Customize reminder messages',
    description: 'Personalize your payment reminder emails',
    completed: false,
    optional: true,
  },
];

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [steps, setSteps] = useState<OnboardingStep[]>(ONBOARDING_STEPS);
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [showTour, setShowTour] = useState(false);

  // Check if user is new (no invoices, customers, etc.)
  useEffect(() => {
    if (user) {
      // For simplicity, we'll check if this is their first login by looking at localStorage
      const hasSeenOnboarding = localStorage.getItem('flow-onboarding-seen');
      if (!hasSeenOnboarding) {
        setIsOnboardingActive(true);
        setCurrentStep('create-first-invoice');
        setShowTour(true);
      }
    }
  }, [user]);

  const completeStep = (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    ));

    // Move to next uncompleted step
    const currentIndex = steps.findIndex(s => s.id === stepId);
    const nextStep = steps.slice(currentIndex + 1).find(s => !s.completed && !s.optional);
    
    if (nextStep) {
      setCurrentStep(nextStep.id);
    } else {
      // All required steps completed
      setIsOnboardingActive(false);
      setCurrentStep(null);
      localStorage.setItem('flow-onboarding-seen', 'true');
    }
  };

  const startOnboarding = () => {
    setIsOnboardingActive(true);
    setCurrentStep('create-first-invoice');
    setShowTour(true);
  };

  const skipOnboarding = () => {
    setIsOnboardingActive(false);
    setCurrentStep(null);
    setShowTour(false);
    localStorage.setItem('flow-onboarding-seen', 'true');
  };

  const onboardingProgress = steps.filter(s => s.completed).length / steps.filter(s => !s.optional).length * 100;

  return (
    <OnboardingContext.Provider value={{
      isOnboardingActive,
      currentStep,
      steps,
      completeStep,
      startOnboarding,
      skipOnboarding,
      showTour,
      setShowTour,
      onboardingProgress,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}