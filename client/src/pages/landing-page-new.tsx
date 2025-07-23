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
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-semibold text-lg">F</span>
            </div>
            <span className="text-2xl font-medium tracking-tight">Flow</span>
          </div>
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
        <section className="container mx-auto px-4 py-24 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="hero-heading text-foreground">
              Automate everything.
            </h1>
            <p className="subtitle max-w-2xl mx-auto">
              Flow provides intelligent invoice nudging, without the data overload. 
              A developer-friendly approach to streamline your business.
            </p>
            <div className="flex items-center justify-center gap-4 pt-8">
              <Link href="/auth">
                <Button 
                  size="lg" 
                  className="px-8 py-4 text-lg rounded-full bg-primary hover:bg-primary/90 shadow-lg"
                >
                  Discover More
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
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

        {/* Benefits Section */}
        <section id="benefits" className="py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <Badge variant="secondary" className="mb-6">Benefits</Badge>
              <h2 className="section-heading mb-6">
                We've cracked the code.
              </h2>
              <p className="subtitle">
                Flow provides real insights, without the data overload.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1">
                <h3 className="text-xl font-medium mb-4">Amplify Insights</h3>
                <p className="text-muted-foreground">
                  Unlock data-driven decisions with comprehensive analytics, revealing 
                  key opportunities for strategic regional growth.
                </p>
              </div>
              <div className="lg:col-span-1">
                <h3 className="text-xl font-medium mb-4">Control Your Flow</h3>
                <p className="text-muted-foreground">
                  Manage and track invoice statuses, ensuring consistent performance and 
                  streamlined operations everywhere.
                </p>
              </div>
              <div className="lg:col-span-1">
                <h3 className="text-xl font-medium mb-4">Benefits</h3>
                <p className="text-muted-foreground">
                  Adapt to diverse markets with built-in localization for clear 
                  communication and enhanced user experience.
                </p>
              </div>
              <div className="lg:col-span-1">
                <h3 className="text-xl font-medium mb-4">Visualize Growth</h3>
                <p className="text-muted-foreground">
                  Generate precise, visually compelling reports that illustrate 
                  your growth trajectories across all regions.
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

        {/* Comparison Section */}
        <section className="py-24 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="text-center">
                <h3 className="text-2xl font-medium mb-6">Flow</h3>
                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Ultra-fast browsing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Automated invoice tracking</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Real-time analytics</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Smart notifications</span>
                  </div>
                </div>
              </div>
              <div className="text-center opacity-60">
                <h3 className="text-2xl font-medium mb-6">WebSurge</h3>
                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-muted-foreground" />
                    <span>Fast browsing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-muted-foreground" />
                    <span>Basic tracking</span>
                  </div>
                </div>
              </div>
              <div className="text-center opacity-60">
                <h3 className="text-2xl font-medium mb-6">HyperView</h3>
                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-3">
                    <span className="h-5 w-5 text-muted-foreground">×</span>
                    <span>Moderate speeds</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="h-5 w-5 text-muted-foreground">×</span>
                    <span>Limited features</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/20 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-semibold">F</span>
                </div>
                <span className="text-xl font-medium">Flow</span>
              </div>
              <p className="text-muted-foreground">
                Streamline your invoice management with intelligent automation.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-muted-foreground">
            <p>&copy; 2024 Flow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}