import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Mail, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface EmailConnection {
  id: number;
  provider: string;
  email: string;
  isActive: boolean;
  lastTestSent?: string;
  createdAt: string;
}

export function EmailConnectionBanner() {
  const { data: connections = [] } = useQuery<EmailConnection[]>({
    queryKey: ["/api/email/connections"],
  });

  const activeConnection = connections.find(conn => conn.isActive);

  if (activeConnection) {
    return (
      <div className="bg-muted border border-border rounded-lg px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-background rounded-full flex items-center justify-center border">
              <CheckCircle className="h-3 w-3 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Email connected</p>
              <p className="text-xs text-muted-foreground">Reminders sent from {activeConnection.email}</p>
            </div>
          </div>
          <Link href="/email-setup">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-xs">
              Manage
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted border border-border rounded-lg px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-background rounded-full flex items-center justify-center border">
            <Mail className="w-3 h-3 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Connect your email</p>
            <p className="text-xs text-muted-foreground">Required to send payment reminders</p>
          </div>
        </div>
        <Link href="/email-setup">
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-4 py-2">
            Connect Email
          </Button>
        </Link>
      </div>
    </div>
  );
}