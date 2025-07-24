import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus, Sparkles } from 'lucide-react';

interface EmptyStatePromptProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  primaryAction: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  highlight?: boolean;
}

export function EmptyStatePrompt({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  highlight = false,
}: EmptyStatePromptProps) {
  return (
    <Card className={`text-center py-12 ${highlight ? 'border-primary/20 bg-gradient-to-br from-primary/5 to-background' : ''}`}>
      <CardContent className="space-y-4">
        {highlight && (
          <div className="flex justify-center mb-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          </div>
        )}
        
        <div className="flex justify-center">
          <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${
            highlight ? 'bg-primary/10' : 'bg-muted'
          }`}>
            {icon}
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className={`text-lg font-semibold ${highlight ? 'text-primary' : ''}`}>
            {title}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {description}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 justify-center pt-4">
          <Button 
            onClick={primaryAction.onClick}
            className={highlight ? 'bg-primary hover:bg-primary/90' : ''}
          >
            <Plus className="h-4 w-4 mr-2" />
            {primaryAction.label}
          </Button>
          
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
        
        {highlight && (
          <p className="text-xs text-muted-foreground mt-4">
            ✨ Great choice! This will be your first step towards getting paid faster.
          </p>
        )}
      </CardContent>
    </Card>
  );
}