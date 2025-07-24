import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { HelpCircle, ChevronDown, Lightbulb, CheckCircle } from 'lucide-react';

interface HelpTip {
  id: string;
  title: string;
  content: string;
  type: 'tip' | 'warning' | 'info';
}

interface ContextualHelpProps {
  section: 'dashboard' | 'invoices' | 'customers' | 'email';
}

const HELP_CONTENT = {
  dashboard: [
    {
      id: 'dashboard-overview',
      title: 'Understanding your Overview',
      content: 'Your dashboard shows key metrics like outstanding invoices and payment response rates. As you create more invoices, these numbers will update automatically.',
      type: 'info' as const,
    },
    {
      id: 'first-steps',
      title: 'Getting started',
      content: 'Start by creating your first invoice or adding a customer. The checklist at the top will guide you through the essential steps.',
      type: 'tip' as const,
    }
  ],
  invoices: [
    {
      id: 'invoice-creation',
      title: 'Creating invoices',
      content: 'You can create invoices manually or upload existing ones. Each invoice can be tracked from creation to payment.',
      type: 'info' as const,
    },
    {
      id: 'invoice-status',
      title: 'Invoice statuses',
      content: 'Invoices go through different stages: Draft → Sent → Viewed → Paid. You can track where each invoice stands.',
      type: 'tip' as const,
    }
  ],
  customers: [
    {
      id: 'customer-benefits',
      title: 'Why add customers?',
      content: 'Adding customers makes creating invoices faster and helps you track payment history for each client.',
      type: 'tip' as const,
    }
  ],
  email: [
    {
      id: 'email-importance',
      title: 'Connect your email',
      content: 'Email connection is required to send professional payment reminders automatically.',
      type: 'warning' as const,
    }
  ]
};

export function ContextualHelp({ section }: ContextualHelpProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  const helpItems = HELP_CONTENT[section] || [];

  if (!isVisible || helpItems.length === 0) return null;

  const toggleItem = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-sm text-blue-900">Quick Help</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsVisible(false)}
            className="text-blue-600 hover:text-blue-800"
          >
            ×
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {helpItems.map((item) => (
          <Collapsible 
            key={item.id} 
            open={expandedItems.includes(item.id)}
            onOpenChange={() => toggleItem(item.id)}
          >
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-between text-left text-sm p-2 h-auto"
              >
                <div className="flex items-center gap-2">
                  {item.type === 'tip' && <Lightbulb className="h-4 w-4 text-yellow-600" />}
                  {item.type === 'warning' && <HelpCircle className="h-4 w-4 text-orange-600" />}
                  {item.type === 'info' && <CheckCircle className="h-4 w-4 text-blue-600" />}
                  <span className="text-blue-900">{item.title}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-blue-600" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-2 pb-2">
              <p className="text-sm text-blue-800">{item.content}</p>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
}