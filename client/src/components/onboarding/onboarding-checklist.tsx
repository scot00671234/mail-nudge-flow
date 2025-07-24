import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, ArrowRight, X } from 'lucide-react';
import { useOnboarding } from './onboarding-provider';

export function OnboardingChecklist() {
  const { 
    isOnboardingActive, 
    steps, 
    currentStep, 
    onboardingProgress, 
    skipOnboarding 
  } = useOnboarding();

  if (!isOnboardingActive) return null;

  const requiredSteps = steps.filter(s => !s.optional);
  const completedRequired = requiredSteps.filter(s => s.completed).length;

  return (
    <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-background">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs text-primary-foreground font-bold">
                  {completedRequired}
                </span>
              </div>
              Get started with Flow
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Complete these steps to start managing your invoices
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={skipOnboarding}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Progress value={onboardingProgress} className="mt-3" />
        <p className="text-xs text-muted-foreground">
          {completedRequired} of {requiredSteps.length} completed
        </p>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {steps.map((step) => (
          <div 
            key={step.id}
            className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
              currentStep === step.id 
                ? 'border-primary bg-primary/5' 
                : step.completed 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-border'
            }`}
          >
            <div className="flex items-center gap-3">
              {step.completed ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <h4 className={`font-medium text-sm ${
                  step.completed ? 'text-green-700' : 'text-foreground'
                }`}>
                  {step.title}
                  {step.optional && (
                    <span className="text-xs text-muted-foreground ml-2">(Optional)</span>
                  )}
                </h4>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
            
            {currentStep === step.id && !step.completed && (
              <ArrowRight className="h-4 w-4 text-primary animate-pulse" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}