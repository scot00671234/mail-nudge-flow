import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useOnboarding } from './onboarding-provider';
import { useAuth } from '@/hooks/use-auth';

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
}

export function WelcomeModal({ open, onClose }: WelcomeModalProps) {
  const { steps, skipOnboarding } = useOnboarding();
  const { user } = useAuth();

  const handleGetStarted = () => {
    onClose();
    // The onboarding provider will handle showing the tour
  };

  const handleSkip = () => {
    skipOnboarding();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" aria-describedby="welcome-description">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <DialogTitle className="text-xl font-semibold">Welcome to Flow!</DialogTitle>
          </div>
        </DialogHeader>
        
        <div id="welcome-description" className="space-y-4">
          <p className="text-muted-foreground">
            Hi {user?.firstName}! 👋 Let's get you set up to send professional invoices and get paid faster.
          </p>
          
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm">We'll help you:</h4>
            <div className="space-y-2">
              {steps.filter(s => !s.optional).map((step) => (
                <div key={step.id} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{step.title}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Takes about 2 minutes
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleGetStarted} className="flex-1">
              Get Started
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button variant="ghost" onClick={handleSkip}>
              Skip for now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}