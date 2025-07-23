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
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 flex items-center justify-between">
          <span>
            <strong>Email connected!</strong> Payment reminders will be sent from {activeConnection.email}
          </span>
          <Link href="/email-setup">
            <Button variant="outline" size="sm" className="ml-2 border-green-300 text-green-700 hover:bg-green-100">
              Manage
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-medium text-orange-900">Connect Your Email</h3>
              <p className="text-sm text-orange-700">
                Set up email connection to start sending automatic payment reminders
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-orange-300 text-orange-700 bg-white">
              Setup Required
            </Badge>
            <Link href="/email-setup">
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                Connect Email
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}