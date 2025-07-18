import { 
  customers, 
  invoices, 
  emailTemplates, 
  nudgeSchedules, 
  activities, 
  nudgeSettings,
  type Customer, 
  type Invoice, 
  type EmailTemplate, 
  type NudgeSchedule, 
  type Activity, 
  type NudgeSettings,
  type InsertCustomer, 
  type InsertInvoice, 
  type InsertEmailTemplate, 
  type InsertNudgeSchedule, 
  type InsertActivity, 
  type InsertNudgeSettings
} from "@shared/schema";

export interface IStorage {
  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;

  // Invoices
  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoicesByCustomer(customerId: number): Promise<Invoice[]>;
  getOverdueInvoices(): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: number): Promise<boolean>;

  // Email Templates
  getEmailTemplates(): Promise<EmailTemplate[]>;
  getEmailTemplate(id: number): Promise<EmailTemplate | undefined>;
  getEmailTemplateByType(type: string): Promise<EmailTemplate | undefined>;
  createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate>;
  updateEmailTemplate(id: number, template: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined>;
  deleteEmailTemplate(id: number): Promise<boolean>;

  // Nudge Schedules
  getNudgeSchedules(): Promise<NudgeSchedule[]>;
  getNudgeSchedule(id: number): Promise<NudgeSchedule | undefined>;
  getUpcomingNudges(): Promise<NudgeSchedule[]>;
  createNudgeSchedule(schedule: InsertNudgeSchedule): Promise<NudgeSchedule>;
  updateNudgeSchedule(id: number, schedule: Partial<InsertNudgeSchedule>): Promise<NudgeSchedule | undefined>;
  deleteNudgeSchedule(id: number): Promise<boolean>;

  // Activities
  getActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Nudge Settings
  getNudgeSettings(): Promise<NudgeSettings>;
  updateNudgeSettings(settings: Partial<InsertNudgeSettings>): Promise<NudgeSettings>;

  // Dashboard metrics
  getDashboardMetrics(): Promise<{
    outstandingInvoices: number;
    outstandingValue: number;
    responseRate: number;
    nudgesSent: number;
    avgCollectionTime: number;
  }>;
}

export class MemStorage implements IStorage {
  private customers: Map<number, Customer>;
  private invoices: Map<number, Invoice>;
  private emailTemplates: Map<number, EmailTemplate>;
  private nudgeSchedules: Map<number, NudgeSchedule>;
  private activities: Map<number, Activity>;
  private nudgeSettings: NudgeSettings;
  private currentId: { [key: string]: number };

  constructor() {
    this.customers = new Map();
    this.invoices = new Map();
    this.emailTemplates = new Map();
    this.nudgeSchedules = new Map();
    this.activities = new Map();
    this.currentId = {
      customers: 1,
      invoices: 1,
      emailTemplates: 1,
      nudgeSchedules: 1,
      activities: 1,
    };

    // Initialize with default nudge settings
    this.nudgeSettings = {
      id: 1,
      firstReminderDays: 7,
      secondReminderDays: 14,
      finalNoticeDays: 21,
      autoNudgeEnabled: true,
      businessHoursOnly: true,
      weekdaysOnly: true,
    };

    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default email templates
    const templates = [
      {
        name: "First Reminder",
        type: "first_reminder",
        subject: "Payment Reminder: Invoice {{invoiceNumber}}",
        body: "Dear {{customerName}},\n\nThis is a friendly reminder that invoice {{invoiceNumber}} for ${{amount}} is now due. Please process payment at your earliest convenience.\n\nThank you for your business!",
        isActive: true,
        createdAt: new Date(),
      },
      {
        name: "Second Reminder",
        type: "second_reminder",
        subject: "Second Notice: Invoice {{invoiceNumber}} Past Due",
        body: "Dear {{customerName}},\n\nInvoice {{invoiceNumber}} for ${{amount}} is now past due. Please remit payment immediately to avoid any late fees.\n\nIf you have any questions, please contact us.\n\nThank you.",
        isActive: true,
        createdAt: new Date(),
      },
      {
        name: "Final Notice",
        type: "final_notice",
        subject: "FINAL NOTICE: Invoice {{invoiceNumber}} - Immediate Action Required",
        body: "Dear {{customerName}},\n\nThis is our final notice regarding invoice {{invoiceNumber}} for ${{amount}}. Payment is seriously past due.\n\nPlease remit payment immediately or contact us to discuss payment arrangements.\n\nFailure to respond may result in collection activities.",
        isActive: true,
        createdAt: new Date(),
      },
    ];

    templates.forEach((template) => {
      const id = this.currentId.emailTemplates++;
      this.emailTemplates.set(id, { ...template, id } as EmailTemplate);
    });
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.currentId.customers++;
    const customer: Customer = {
      ...insertCustomer,
      id,
      createdAt: new Date(),
    };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: number, updateData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    
    const updated = { ...customer, ...updateData };
    this.customers.set(id, updated);
    return updated;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    return this.customers.delete(id);
  }

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async getInvoicesByCustomer(customerId: number): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(
      invoice => invoice.customerId === customerId
    );
  }

  async getOverdueInvoices(): Promise<Invoice[]> {
    const now = new Date();
    return Array.from(this.invoices.values()).filter(
      invoice => invoice.status !== "paid" && new Date(invoice.dueDate) < now
    );
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = this.currentId.invoices++;
    const invoice: Invoice = {
      ...insertInvoice,
      id,
      amount: insertInvoice.amount.toString(),
      createdAt: new Date(),
    };
    this.invoices.set(id, invoice);
    
    // Create activity
    await this.createActivity({
      type: "invoice_created",
      description: `Invoice ${invoice.number} created`,
      invoiceId: id,
      customerId: invoice.customerId,
    });

    return invoice;
  }

  async updateInvoice(id: number, updateData: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;
    
    const updated = { 
      ...invoice, 
      ...updateData,
      amount: updateData.amount ? updateData.amount.toString() : invoice.amount
    };
    this.invoices.set(id, updated);

    // Create activity for status changes
    if (updateData.status && updateData.status !== invoice.status) {
      await this.createActivity({
        type: updateData.status === "paid" ? "payment_received" : "invoice_updated",
        description: `Invoice ${invoice.number} status changed to ${updateData.status}`,
        invoiceId: id,
        customerId: invoice.customerId,
      });
    }

    return updated;
  }

  async deleteInvoice(id: number): Promise<boolean> {
    return this.invoices.delete(id);
  }

  // Email Templates
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return Array.from(this.emailTemplates.values());
  }

  async getEmailTemplate(id: number): Promise<EmailTemplate | undefined> {
    return this.emailTemplates.get(id);
  }

  async getEmailTemplateByType(type: string): Promise<EmailTemplate | undefined> {
    return Array.from(this.emailTemplates.values()).find(template => template.type === type);
  }

  async createEmailTemplate(insertTemplate: InsertEmailTemplate): Promise<EmailTemplate> {
    const id = this.currentId.emailTemplates++;
    const template: EmailTemplate = {
      ...insertTemplate,
      id,
      createdAt: new Date(),
    };
    this.emailTemplates.set(id, template);
    return template;
  }

  async updateEmailTemplate(id: number, updateData: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined> {
    const template = this.emailTemplates.get(id);
    if (!template) return undefined;
    
    const updated = { ...template, ...updateData };
    this.emailTemplates.set(id, updated);
    return updated;
  }

  async deleteEmailTemplate(id: number): Promise<boolean> {
    return this.emailTemplates.delete(id);
  }

  // Nudge Schedules
  async getNudgeSchedules(): Promise<NudgeSchedule[]> {
    return Array.from(this.nudgeSchedules.values());
  }

  async getNudgeSchedule(id: number): Promise<NudgeSchedule | undefined> {
    return this.nudgeSchedules.get(id);
  }

  async getUpcomingNudges(): Promise<NudgeSchedule[]> {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return Array.from(this.nudgeSchedules.values())
      .filter(schedule => 
        schedule.status === "scheduled" && 
        new Date(schedule.scheduledDate) >= now && 
        new Date(schedule.scheduledDate) <= nextWeek
      )
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  }

  async createNudgeSchedule(insertSchedule: InsertNudgeSchedule): Promise<NudgeSchedule> {
    const id = this.currentId.nudgeSchedules++;
    const schedule: NudgeSchedule = {
      ...insertSchedule,
      id,
      createdAt: new Date(),
    };
    this.nudgeSchedules.set(id, schedule);
    return schedule;
  }

  async updateNudgeSchedule(id: number, updateData: Partial<InsertNudgeSchedule>): Promise<NudgeSchedule | undefined> {
    const schedule = this.nudgeSchedules.get(id);
    if (!schedule) return undefined;
    
    const updated = { ...schedule, ...updateData };
    this.nudgeSchedules.set(id, updated);

    // Create activity for sent nudges
    if (updateData.status === "sent" && schedule.status !== "sent") {
      const invoice = await this.getInvoice(schedule.invoiceId);
      await this.createActivity({
        type: "nudge_sent",
        description: `${schedule.nudgeType.replace('_', ' ')} sent for invoice ${invoice?.number}`,
        invoiceId: schedule.invoiceId,
        customerId: invoice?.customerId,
      });
    }

    return updated;
  }

  async deleteNudgeSchedule(id: number): Promise<boolean> {
    return this.nudgeSchedules.delete(id);
  }

  // Activities
  async getActivities(limit = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentId.activities++;
    const activity: Activity = {
      ...insertActivity,
      id,
      createdAt: new Date(),
    };
    this.activities.set(id, activity);
    return activity;
  }

  // Nudge Settings
  async getNudgeSettings(): Promise<NudgeSettings> {
    return this.nudgeSettings;
  }

  async updateNudgeSettings(updateData: Partial<InsertNudgeSettings>): Promise<NudgeSettings> {
    this.nudgeSettings = { ...this.nudgeSettings, ...updateData };
    return this.nudgeSettings;
  }

  // Dashboard Metrics
  async getDashboardMetrics(): Promise<{
    outstandingInvoices: number;
    outstandingValue: number;
    responseRate: number;
    nudgesSent: number;
    avgCollectionTime: number;
  }> {
    const allInvoices = Array.from(this.invoices.values());
    const outstandingInvoices = allInvoices.filter(inv => inv.status !== "paid");
    const outstandingValue = outstandingInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const nudgesSent = Array.from(this.nudgeSchedules.values())
      .filter(schedule => schedule.status === "sent" && new Date(schedule.sentDate || 0) >= thisMonth)
      .length;

    const paidInvoices = allInvoices.filter(inv => inv.status === "paid" && inv.paidDate);
    const avgCollectionTime = paidInvoices.length > 0 
      ? paidInvoices.reduce((sum, inv) => {
          const diffTime = new Date(inv.paidDate!).getTime() - new Date(inv.issueDate).getTime();
          return sum + Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }, 0) / paidInvoices.length
      : 0;

    // Mock response rate calculation
    const responseRate = 78;

    return {
      outstandingInvoices: outstandingInvoices.length,
      outstandingValue,
      responseRate,
      nudgesSent,
      avgCollectionTime: Math.round(avgCollectionTime),
    };
  }
}

export const storage = new MemStorage();
