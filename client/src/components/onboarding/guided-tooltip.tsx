import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, X, Lightbulb } from 'lucide-react';

interface GuidedTooltipProps {
  isVisible: boolean;
  title: string;
  description: string;
  targetSelector?: string;
  onNext?: () => void;
  onSkip?: () => void;
  position?: 'top' | 'bottom' | 'left' | 'right';
  showArrow?: boolean;
}

export function GuidedTooltip({
  isVisible,
  title,
  description,
  targetSelector,
  onNext,
  onSkip,
  position = 'bottom',
  showArrow = true,
}: GuidedTooltipProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (isVisible && targetSelector) {
      const element = document.querySelector(targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        
        // Scroll element into view if needed
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add highlight effect
        element.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
        
        return () => {
          element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
        };
      }
    }
  }, [isVisible, targetSelector]);

  if (!isVisible) return null;

  const getTooltipPosition = () => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const margin = 16;
    let style: React.CSSProperties = { position: 'fixed', zIndex: 50 };

    switch (position) {
      case 'bottom':
        style.top = targetRect.bottom + margin;
        style.left = targetRect.left + targetRect.width / 2;
        style.transform = 'translateX(-50%)';
        break;
      case 'top':
        style.bottom = window.innerHeight - targetRect.top + margin;
        style.left = targetRect.left + targetRect.width / 2;
        style.transform = 'translateX(-50%)';
        break;
      case 'right':
        style.left = targetRect.right + margin;
        style.top = targetRect.top + targetRect.height / 2;
        style.transform = 'translateY(-50%)';
        break;
      case 'left':
        style.right = window.innerWidth - targetRect.left + margin;
        style.top = targetRect.top + targetRect.height / 2;
        style.transform = 'translateY(-50%)';
        break;
    }

    return style;
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onSkip} />
      
      {/* Tooltip */}
      <Card 
        className="max-w-sm shadow-lg border-primary/20"
        style={getTooltipPosition()}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="h-4 w-4 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm mb-1">{title}</h4>
              <p className="text-sm text-muted-foreground mb-3">{description}</p>
              
              <div className="flex items-center gap-2">
                {onNext && (
                  <Button size="sm" onClick={onNext} className="flex-1">
                    Got it
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                )}
                {onSkip && (
                  <Button variant="ghost" size="sm" onClick={onSkip}>
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}