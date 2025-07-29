import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { ArrowRight, CheckCircle, Mail, Clock, BarChart3, Zap } from 'lucide-react';

export default function LandingPage() {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: <Mail className="h-6 w-6 text-blue-500" />,
      title: "Smart Email Reminders",
      description: "Automated payment reminders that get results without being pushy"
    },
    {
      icon: <Clock className="h-6 w-6 text-green-500" />,
      title: "Perfect Timing",
      description: "AI-powered scheduling sends reminders at the optimal times"
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-purple-500" />,
      title: "Real-time Analytics",
      description: "Track payment rates, response times, and customer behavior"
    },
    {
      icon: <Zap className="h-6 w-6 text-orange-500" />,
      title: "Quick Setup",
      description: "Connect your email and start sending reminders in under 5 minutes"
    }
  ];

  const benefits = [
    "Get paid 3x faster with automated follow-ups",
    "Reduce time spent chasing payments by 80%", 
    "Improve cash flow with predictable collections",
    "Professional email templates that convert",
    "Works with Gmail and Outlook accounts"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Flow
            </span>
          </div>
          <Button 
            onClick={() => setLocation('/auth')}
            variant="outline"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Get Paid{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Faster
            </span>
            {' '}with Smart Invoice Reminders
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Stop chasing payments manually. Flow automates your invoice follow-ups 
            with personalized email reminders that actually get results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setLocation('/auth')}
              className="text-lg px-8 py-3"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-3"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Everything you need to collect payments faster
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful automation tools designed to help small businesses get paid on time
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center border-0 shadow-lg bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
              <CardHeader>
                <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-background flex items-center justify-center">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Join thousands of businesses getting paid faster
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
              <Button 
                size="lg" 
                className="mt-8"
                onClick={() => setLocation('/auth')}
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Ready to transform your cash flow?</h3>
                <p className="mb-6 opacity-90">
                  Start your free trial today and see results in your first week
                </p>
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="text-3xl font-bold">87%</div>
                  <div className="text-sm opacity-80">of invoices paid within 7 days</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto text-center border-0 shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Start your free trial</CardTitle>
            <CardDescription className="text-blue-100">
              No credit card required • Setup in under 5 minutes • Cancel anytime
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-3"
              onClick={() => setLocation('/auth')}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
            <span className="font-bold">Flow</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © 2025 Flow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}