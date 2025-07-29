import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  Check, 
  AlertCircle, 
  Settings, 
  Clock, 
  Plus,
  Zap,
  CheckCircle
} from 'lucide-react';

interface EmailFlowStep {
  id: string;
  name: string;
  days: number;
  enabled: boolean;
  template: string;
}

const DEFAULT_FLOW_STEPS: EmailFlowStep[] = [
  {
    id: 'first-reminder',
    name: 'First Reminder',
    days: 3,
    enabled: true,
    template: 'Friendly payment reminder'
  },
  {
    id: 'second-reminder',
    name: 'Follow-up',
    days: 7,
    enabled: true,
    template: 'Professional follow-up'
  },
  {
    id: 'final-notice',
    name: 'Final Notice',
    days: 14,
    enabled: true,
    template: 'Final payment notice'
  }
];

export const EmailFlowWidget: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [flowSteps, setFlowSteps] = useState<EmailFlowStep[]>(DEFAULT_FLOW_STEPS);
  const [isFlowEnabled, setIsFlowEnabled] = useState(true);

  const handleConnectEmail = () => {
    // Simulate email connection
    setIsConnected(true);
  };

  const handleToggleStep = (stepId: string) => {
    setFlowSteps(prev => 
      prev.map(step => 
        step.id === stepId 
          ? { ...step, enabled: !step.enabled }
          : step
      )
    );
  };

  const handleUpdateDays = (stepId: string, days: number) => {
    setFlowSteps(prev => 
      prev.map(step => 
        step.id === stepId 
          ? { ...step, days }
          : step
      )
    );
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="text-blue-600" size={20} />
            Email Payment Flow
          </CardTitle>
          <Badge variant={isConnected ? "default" : "secondary"} className="gap-1">
            {isConnected ? (
              <>
                <CheckCircle size={12} />
                Connected
              </>
            ) : (
              <>
                <AlertCircle size={12} />
                Setup Required
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Email Connection Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium">Email Connection</span>
            </div>
            {isConnected ? (
              <Badge variant="default" className="gap-1">
                <Check size={12} />
                Gmail Connected
              </Badge>
            ) : (
              <Button size="sm" onClick={handleConnectEmail}>
                <Mail size={14} className="mr-2" />
                Connect Email
              </Button>
            )}
          </div>
          
          {isConnected && (
            <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <CheckCircle size={12} className="text-green-500" />
              Connected to: user@example.com
            </div>
          )}
        </div>

        <Separator />

        {/* Flow Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Automatic Payment Reminders</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Send timed reminders for overdue invoices
            </div>
          </div>
          <Switch 
            checked={isFlowEnabled} 
            onCheckedChange={setIsFlowEnabled}
            disabled={!isConnected}
          />
        </div>

        {/* Flow Steps */}
        {isFlowEnabled && isConnected && (
          <div className="space-y-3">
            <div className="text-sm font-medium flex items-center gap-2">
              <Clock size={14} />
              Reminder Timeline
            </div>
            
            {flowSteps.map((step, index) => (
              <div key={step.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium">{step.name}</span>
                  </div>
                  <Switch 
                    checked={step.enabled} 
                    onCheckedChange={() => handleToggleStep(step.id)}
                    size="sm"
                  />
                </div>
                
                {step.enabled && (
                  <div className="ml-8 space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`${step.id}-days`} className="text-xs">Send after:</Label>
                      <Input
                        id={`${step.id}-days`}
                        type="number"
                        value={step.days}
                        onChange={(e) => handleUpdateDays(step.id, parseInt(e.target.value) || 0)}
                        className="w-16 h-7 text-xs"
                        min="1"
                        max="30"
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-400">days</span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Template: {step.template}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            <Button size="sm" variant="outline" className="w-full">
              <Plus size={14} className="mr-2" />
              Add Step
            </Button>
          </div>
        )}

        {/* Quick Setup Guide */}
        {!isConnected && (
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Quick Setup Guide
            </div>
            <div className="space-y-2 text-xs text-blue-800 dark:text-blue-200">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-blue-300 dark:border-blue-700 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-300 dark:bg-blue-700 rounded-full"></div>
                </div>
                Connect your email account
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-blue-300 dark:border-blue-700 rounded-full flex items-center justify-center">
                  <span className="text-xs">2</span>
                </div>
                Configure reminder timing
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-blue-300 dark:border-blue-700 rounded-full flex items-center justify-center">
                  <span className="text-xs">3</span>
                </div>
                Customize email templates
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button size="sm" className="flex-1" disabled={!isConnected}>
            <Zap size={14} className="mr-2" />
            Test Flow
          </Button>
          <Button size="sm" variant="outline" disabled={!isConnected}>
            <Settings size={14} className="mr-2" />
            Customize
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};