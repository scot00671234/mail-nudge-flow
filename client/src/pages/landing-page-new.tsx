import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, Zap, Shield, BarChart3, Mail, Users, Clock, Star, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

export default function LandingPage() {
  const auth = useAuth();
  const user = auth?.user;

  // Redirect authenticated users to dashboard
  if (user) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <img src="/logo.svg" alt="Flow Logo" className="h-8" />
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#benefits" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Benefits</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors font-medium">How-to</a>
            <a href="#specifications" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Specifications</a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Contact Us</a>
            <Link href="/auth">
              <Button className="px-6 py-2 rounded-full bg-primary hover:bg-primary/90">Learn More</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-32 text-center">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="relative">
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-full max-w-sm h-6 bg-gradient-to-r from-transparent via-primary/20 to-transparent rounded-full blur-xl"></div>
              <h1 className="hero-heading text-foreground">
                Manage everything.
              </h1>
            </div>
            <p className="subtitle max-w-3xl mx-auto text-xl">
              Flow transforms invoice collection with intelligent automation, real-time insights, 
              and seamless payment workflows that accelerate your cash flow.
            </p>
            <div className="flex items-center justify-center gap-4 pt-8">
              <Link href="/auth">
                <Button 
                  size="lg" 
                  className="px-8 py-4 text-lg rounded-full bg-primary hover:bg-primary/90 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                >
                  Discover More
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            
            {/* Hero Visual */}
            <div className="mt-20 relative">
              <div className="w-full max-w-4xl mx-auto h-96 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl border border-border/40 overflow-hidden shadow-2xl">
                <div className="p-8 h-full flex flex-col justify-center">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-semibold">Payment Collection</h3>
                      <Badge className="bg-primary/10 text-primary">Live</Badge>
                    </div>
                    <div className="text-5xl font-bold text-primary mb-2">87%</div>
                    <p className="text-muted-foreground">Collection Rate Improvement</p>
                    
                    {/* Mock Chart */}
                    <div className="mt-6 flex items-end space-x-2 h-20">
                      {[40, 65, 45, 80, 70, 90, 85].map((height, i) => (
                        <div 
                          key={i} 
                          className="bg-primary/20 rounded-t flex-1 transition-all duration-1000 ease-out"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="border-t border-border/40 py-16">
          <div className="container mx-auto px-4">
            <p className="text-center text-sm text-muted-foreground mb-12 font-medium">Trusted by:</p>
            <div className="flex items-center justify-center space-x-12 opacity-60">
              <div className="text-2xl font-semibold text-muted-foreground">Logoipsum</div>
              <div className="text-2xl font-semibold text-muted-foreground">Logoipsum</div>
              <div className="text-2xl font-semibold text-muted-foreground">LOGOIPSUM</div>
              <div className="text-2xl font-semibold text-muted-foreground">logoipsum</div>
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <blockquote className="text-2xl md:text-3xl font-medium text-foreground leading-relaxed mb-8">
                "I was skeptical, but Flow has completely transformed the way I manage my 
                invoicing. The automated nudging is so intuitive, and the platform is so 
                easy to use. I can't imagine running my business without it."
              </blockquote>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold">JS</span>
                </div>
                <div className="text-left">
                  <p className="font-medium">Sarah Chen</p>
                  <p className="text-muted-foreground text-sm">Head of Finance</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <Badge variant="secondary" className="mb-6 text-primary bg-primary/10">Benefits</Badge>
              <h2 className="section-heading mb-6">
                We've simplified invoice collection.
              </h2>
              <p className="subtitle">
                Flow provides intelligent payment tracking, without the complexity overload.
              </p>
            </div>
          </div>
        </section>

        {/* Map Your Success Section */}
        <section id="how-it-works" className="py-32">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto mb-20">
              <h2 className="section-heading mb-6">
                Map Your Success
              </h2>
              <p className="subtitle">
                Simple steps to transform your invoice collection process
              </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-16 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="text-8xl font-light text-muted-foreground/30 mb-6">01</div>
                <h3 className="text-xl font-medium mb-4">Get Started</h3>
                <p className="text-muted-foreground">
                  With our intuitive setup, you're up and running in minutes. 
                  Import your invoices and customers seamlessly.
                </p>
              </div>
              <div className="text-center">
                <div className="text-8xl font-light text-muted-foreground/30 mb-6">02</div>
                <h3 className="text-xl font-medium mb-4">Customize and Configure</h3>
                <p className="text-muted-foreground">
                  Adapt Flow to your specific requirements and preferences. 
                  Set up automated nudging schedules and email templates.
                </p>
              </div>
              <div className="text-center">
                <div className="text-8xl font-light text-muted-foreground/30 mb-6">03</div>
                <h3 className="text-xl font-medium mb-4">Grow Your Business</h3>
                <p className="text-muted-foreground">
                  Make informed decisions to exceed your goals. 
                  Watch your collection rates improve automatically.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="section-heading mb-6">
              Why Choose Flow?
            </h2>
            <p className="subtitle max-w-2xl mx-auto mb-12">
              You need a solution that keeps up. That's why we developed Flow. A developer-friendly approach to streamline your business.
            </p>
            <Link href="/auth">
              <Button 
                size="lg" 
                className="px-8 py-4 text-lg rounded-full bg-primary hover:bg-primary/90"
              >
                Discover More
              </Button>
            </Link>
          </div>
        </section>

        {/* Specifications Section */}
        <section id="specifications" className="py-24 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-6 text-primary bg-primary/10">Specifications</Badge>
              <h2 className="section-heading mb-6">
                Choose Your Plan
              </h2>
              <p className="subtitle max-w-2xl mx-auto">
                Select the perfect plan for your business size and needs
              </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="relative bg-white border-2 border-border/40 hover:border-primary/40 transition-all duration-300">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">Starter</CardTitle>
                  <div className="text-3xl font-bold mt-4">$29<span className="text-lg font-normal text-muted-foreground">/month</span></div>
                  <CardDescription>Perfect for small businesses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">Up to 100 invoices/month</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">Automated nudging</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">Basic analytics</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">Email support</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="relative bg-white border-2 border-primary shadow-lg scale-105">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-white">Most Popular</Badge>
                </div>
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">Professional</CardTitle>
                  <div className="text-3xl font-bold mt-4">$79<span className="text-lg font-normal text-muted-foreground">/month</span></div>
                  <CardDescription>For growing businesses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">Up to 500 invoices/month</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">Advanced automation</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">Real-time analytics</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">Priority support</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">API access</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="relative bg-white border-2 border-border/40 hover:border-primary/40 transition-all duration-300">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">Enterprise</CardTitle>
                  <div className="text-3xl font-bold mt-4">$199<span className="text-lg font-normal text-muted-foreground">/month</span></div>
                  <CardDescription>For large organizations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">Unlimited invoices</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">Custom workflows</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">Advanced reporting</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">Dedicated support</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">SLA guarantee</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                <span className="text-background font-semibold text-sm">F</span>
              </div>
              <span className="text-lg font-medium">Flow. 2025</span>
            </div>
            <div className="flex items-center space-x-8 text-sm text-muted-foreground">
              <a href="#benefits" className="hover:text-foreground transition-colors">Benefits</a>
              <a href="#specifications" className="hover:text-foreground transition-colors">Specifications</a>
              <a href="#how-it-works" className="hover:text-foreground transition-colors">How-to</a>
              <a href="#contact" className="hover:text-foreground transition-colors">Contact Us</a>
            </div>
            <p className="text-sm text-muted-foreground">All Rights Reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}