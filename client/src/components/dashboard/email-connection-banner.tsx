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
      <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-900">Email connected</p>
              <p className="text-xs text-green-700">Reminders will be sent from {activeConnection.email}</p>
            </div>
          </div>
          <Link href="/email-setup">
            <Button variant="ghost" size="sm" className="text-green-700 hover:bg-green-100 text-xs">
              Manage
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900">Connect your email</p>
            <p className="text-xs text-blue-700">Set up email to send automatic payment reminders</p>
          </div>
        </div>
        <Link href="/email-setup">
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-white text-xs px-4 py-2 rounded-lg">
            Connect Email
          </Button>
        </Link>
      </div>
    </div>
  );
}