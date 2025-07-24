import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { emailService, EMAIL_PROVIDERS } from "./email-service";
import Stripe from "stripe";
import { 
  insertCustomerSchema, 
  insertInvoiceSchema, 
  insertEmailTemplateSchema, 
  insertNudgeScheduleSchema,
  insertNudgeSettingsSchema 
} from "@shared/schema";
import { z } from "zod";

// Initialize Stripe if keys are available
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-06-30.basil",
  });
}

function requireAuth(req: any, res: any, next: any) {
  if (!req.requireAuth()) {
    return res.sendStatus(401);
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication first
  setupAuth(app);

  // Dashboard metrics
  app.get("/api/dashboard/metrics", requireAuth, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Customers
  app.get("/api/customers", requireAuth, async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", requireAuth, async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.put("/api/customers/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, validatedData);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCustomer(id);
      if (!deleted) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Invoices
  app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const validatedData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(validatedData);
      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid invoice data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  app.put("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertInvoiceSchema.partial().parse(req.body);
      const invoice = await storage.updateInvoice(id, validatedData);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid invoice data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });

  app.delete("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteInvoice(id);
      if (!deleted) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });

  // Send nudge for specific invoice
  app.post("/api/invoices/:id/nudge", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      // Create immediate nudge schedule
      const nudgeSchedule = await storage.createNudgeSchedule({
        invoiceId: id,
        templateId: 1, // Use first reminder template
        scheduledDate: new Date(),
        nudgeType: "first_reminder",
        status: "sent",
        sentDate: new Date(),
      });

      res.json({ message: "Nudge sent successfully", schedule: nudgeSchedule });
    } catch (error) {
      res.status(500).json({ message: "Failed to send nudge" });
    }
  });

  // Email Templates
  app.get("/api/email-templates", async (req, res) => {
    try {
      const templates = await storage.getEmailTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch email templates" });
    }
  });

  app.get("/api/email-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getEmailTemplate(id);
      if (!template) {
        return res.status(404).json({ message: "Email template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch email template" });
    }
  });

  app.post("/api/email-templates", async (req, res) => {
    try {
      const validatedData = insertEmailTemplateSchema.parse(req.body);
      const template = await storage.createEmailTemplate(validatedData);
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid template data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create email template" });
    }
  });

  app.put("/api/email-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertEmailTemplateSchema.partial().parse(req.body);
      const template = await storage.updateEmailTemplate(id, validatedData);
      if (!template) {
        return res.status(404).json({ message: "Email template not found" });
      }
      res.json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid template data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update email template" });
    }
  });

  // Nudge Schedules
  app.get("/api/nudge-schedules", async (req, res) => {
    try {
      const schedules = await storage.getNudgeSchedules();
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch nudge schedules" });
    }
  });

  app.get("/api/nudge-schedules/upcoming", async (req, res) => {
    try {
      const schedules = await storage.getUpcomingNudges();
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch upcoming nudges" });
    }
  });

  app.post("/api/nudge-schedules", async (req, res) => {
    try {
      const validatedData = insertNudgeScheduleSchema.parse(req.body);
      const schedule = await storage.createNudgeSchedule(validatedData);
      res.status(201).json(schedule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid schedule data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create nudge schedule" });
    }
  });

  app.put("/api/nudge-schedules/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertNudgeScheduleSchema.partial().parse(req.body);
      const schedule = await storage.updateNudgeSchedule(id, validatedData);
      if (!schedule) {
        return res.status(404).json({ message: "Nudge schedule not found" });
      }
      res.json(schedule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid schedule data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update nudge schedule" });
    }
  });

  // Activities
  app.get("/api/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Nudge Settings
  app.get("/api/nudge-settings", async (req, res) => {
    try {
      const settings = await storage.getNudgeSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch nudge settings" });
    }
  });

  app.put("/api/nudge-settings", async (req, res) => {
    try {
      const validatedData = insertNudgeSettingsSchema.parse(req.body);
      const settings = await storage.updateNudgeSettings(validatedData);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid settings data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update nudge settings" });
    }
  });

  // Email Integration Routes
  
  // Get available email providers
  app.get("/api/email/providers", requireAuth, (req, res) => {
    res.json(EMAIL_PROVIDERS);
  });

  // Get user's email connections
  app.get("/api/email/connections", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const connections = await storage.getEmailConnections(userId);
      res.json(connections);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch email connections" });
    }
  });

  // Initiate OAuth flow
  app.get("/api/oauth/:provider/auth", requireAuth, async (req, res) => {
    try {
      const { provider } = req.params;
      let authUrl: string;

      if (provider === 'gmail') {
        authUrl = emailService.getGmailAuthUrl();
      } else if (provider === 'outlook') {
        authUrl = emailService.getOutlookAuthUrl();
      } else {
        return res.status(400).json({ message: "Unsupported email provider" });
      }

      // Store user ID in session for callback
      req.session.oauthUserId = req.user.id;
      res.json({ authUrl });
    } catch (error) {
      console.error('OAuth initiation failed:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : "OAuth setup failed" });
    }
  });

  // OAuth callback handlers
  app.get("/api/oauth/gmail/callback", async (req, res) => {
    try {
      const { code, error } = req.query;
      if (error) {
        return res.redirect(`/?error=${encodeURIComponent('OAuth permission denied')}`);
      }
      if (!code || !req.session.oauthUserId) {
        return res.redirect(`/?error=${encodeURIComponent('OAuth callback failed')}`);
      }

      const connection = await emailService.handleGmailCallback(code as string, req.session.oauthUserId);
      delete req.session.oauthUserId;
      
      res.redirect(`/?email_connected=gmail&email=${encodeURIComponent(connection.email)}`);
    } catch (error) {
      console.error('Gmail callback failed:', error);
      res.redirect(`/?error=${encodeURIComponent('Failed to connect Gmail account')}`);
    }
  });

  app.get("/api/oauth/outlook/callback", async (req, res) => {
    try {
      const { code, error } = req.query;
      if (error) {
        return res.redirect(`/?error=${encodeURIComponent('OAuth permission denied')}`);
      }
      if (!code || !req.session.oauthUserId) {
        return res.redirect(`/?error=${encodeURIComponent('OAuth callback failed')}`);
      }

      const connection = await emailService.handleOutlookCallback(code as string, req.session.oauthUserId);
      delete req.session.oauthUserId;
      
      res.redirect(`/?email_connected=outlook&email=${encodeURIComponent(connection.email)}`);
    } catch (error) {
      console.error('Outlook callback failed:', error);
      res.redirect(`/?error=${encodeURIComponent('Failed to connect Outlook account')}`);
    }
  });

  // Send test email
  app.post("/api/email/test", requireAuth, async (req, res) => {
    try {
      const { connectionId, testEmail } = req.body;
      if (!connectionId || !testEmail) {
        return res.status(400).json({ message: "Connection ID and test email are required" });
      }

      await emailService.sendTestEmail(connectionId, testEmail);
      res.json({ message: "Test email sent successfully!" });
    } catch (error) {
      console.error('Test email failed:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to send test email" });
    }
  });

  // Disconnect email provider
  app.delete("/api/email/connections/:id", requireAuth, async (req, res) => {
    try {
      const connectionId = parseInt(req.params.id);
      const success = await storage.deleteEmailConnection(connectionId);
      if (!success) {
        return res.status(404).json({ message: "Email connection not found" });
      }
      res.json({ message: "Email connection removed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove email connection" });
    }
  });

  // Email Footer Management Routes
  
  // Get footer configuration for current user
  app.get("/api/email/footer-config", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const { EmailFooterService } = await import("./email-footer-service");
      const config = await EmailFooterService.getFooterConfig(userId);
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch footer configuration" });
    }
  });

  // Update footer preference
  app.put("/api/email/footer-preference", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const { hideFooter } = req.body;
      
      if (typeof hideFooter !== 'boolean') {
        return res.status(400).json({ message: "hideFooter must be a boolean value" });
      }

      const { EmailFooterService } = await import("./email-footer-service");
      const result = await EmailFooterService.updateFooterPreference(userId, hideFooter);
      
      if (!result.success) {
        return res.status(403).json({ message: result.message });
      }

      res.json({ message: result.message, success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to update footer preference" });
    }
  });

  // Handle subscription plan changes (webhook endpoint for Stripe)
  app.post("/api/webhooks/subscription-changed", async (req, res) => {
    try {
      const { userId, newPlan } = req.body;
      
      if (!userId || !newPlan) {
        return res.status(400).json({ message: "userId and newPlan are required" });
      }

      const { EmailFooterService } = await import("./email-footer-service");
      await EmailFooterService.handlePlanDowngrade(userId, newPlan);
      
      res.json({ message: "Subscription plan updated successfully" });
    } catch (error) {
      console.error('Subscription webhook failed:', error);
      res.status(500).json({ message: "Failed to process subscription change" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
