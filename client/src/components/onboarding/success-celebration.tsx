import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SuccessCelebrationProps {
  isVisible: boolean;
  title: string;
  description: string;
  onContinue: () => void;
  confetti?: boolean;
}

export function SuccessCelebration({
  isVisible,
  title,
  description,
  onContinue,
  confetti = true,
}: SuccessCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible && confetti) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, confetti]);

  return (
    <Dialog open={isVisible} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md text-center" aria-describedby="success-description">
        <div className="relative">
          {/* Confetti Animation */}
          <AnimatePresence>
            {showConfetti && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-primary rounded-full"
                    initial={{ 
                      x: '50%', 
                      y: '50%', 
                      scale: 0,
                      rotate: 0 
                    }}
                    animate={{ 
                      x: Math.random() * 200 - 100,
                      y: Math.random() * 200 - 100,
                      scale: [0, 1, 0],
                      rotate: 360 
                    }}
                    transition={{ 
                      duration: 2, 
                      delay: i * 0.1,
                      ease: "easeOut" 
                    }}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>

          <div className="space-y-4 py-4">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="flex justify-center"
            >
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                {title}
              </h3>
              <p id="success-description" className="text-muted-foreground">
                {description}
              </p>
            </motion.div>

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="pt-4"
            >
              <Button onClick={onContinue} className="w-full">
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}