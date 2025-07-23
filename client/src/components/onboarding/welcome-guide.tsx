import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, FileText, Users, Mail, ArrowRight, Play } from "lucide-react";

interface WelcomeGuideProps {
  onClose: () => void;
  onStartTour: () => void;
}

export default function WelcomeGuide({ onClose, onStartTour }: WelcomeGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Flow!",
      description: "Let's get you set up in just a few minutes. Flow will help you get paid faster by automatically sending payment reminders.",
      icon: <CheckCircle className="w-8 h-8 text-green-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Flow makes getting paid simple. Here's what we'll help you do:
          </p>
          <ul className="space-y-2">
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Add your invoices (takes 30 seconds)</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Set up automatic payment reminders</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Track who has paid and who hasn't</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      title: "Adding Your First Invoice",
      description: "You can add invoices by uploading a file or entering details manually. Don't worry - it's super easy!",
      icon: <FileText className="w-8 h-8 text-blue-500" />,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Two Easy Ways:</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <p>📄 <strong>Upload a file:</strong> Drop in your PDF, Excel, or Word document</p>
              <p>✏️ <strong>Type it in:</strong> Fill out a simple form with invoice details</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            Pro tip: Most people start by uploading a few invoices to see how it works!
          </p>
        </div>
      )
    },
    {
      title: "Your Customers",
      description: "Flow keeps track of your customers automatically. When you add invoices, we'll remember who they are for next time.",
      icon: <Users className="w-8 h-8 text-purple-500" />,
      content: (
        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">We remember everything:</h4>
            <div className="space-y-2 text-sm text-purple-800">
              <p>👥 Customer names and email addresses</p>
              <p>📧 Their payment history</p>
              <p>💰 How much they owe you</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Automatic Payment Reminders",
      description: "This is where the magic happens! Flow automatically sends friendly reminders when payments are due.",
      icon: <Mail className="w-8 h-8 text-orange-500" />,
      content: (
        <div className="space-y-4">
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-medium text-orange-900 mb-2">Set it and forget it:</h4>
            <div className="space-y-2 text-sm text-orange-800">
              <p>📅 Reminders are sent at the perfect time</p>
              <p>💌 Professional, friendly messages</p>
              <p>🎯 Customized for each customer</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            Don't worry - you can see and edit every message before it goes out!
          </p>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onStartTour();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {steps[currentStep].icon}
          </div>
          <CardTitle className="text-2xl">{steps[currentStep].title}</CardTitle>
          <CardDescription className="text-lg">
            {steps[currentStep].description}
          </CardDescription>
          <div className="flex justify-center space-x-2 mt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        
        <CardContent>
          {steps[currentStep].content}
          
          <div className="flex justify-between items-center mt-8">
            <div className="flex space-x-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePrevious}>
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button variant="ghost" onClick={onClose}>
                Skip for now
              </Button>
              <Button onClick={handleNext} className="bg-primary hover:bg-primary/90">
                {currentStep === steps.length - 1 ? (
                  <>
                    Start Using Flow
                    <Play className="ml-2 w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}