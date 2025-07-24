import { 
  users,
  customers, 
  invoices, 
  emailTemplates, 
  nudgeSchedules, 
  activities, 
  nudgeSettings,
  emailConnections,
  type User,
  type Customer, 
  type Invoice, 
  type EmailTemplate, 
  type NudgeSchedule, 
  type Activity, 
  type NudgeSettings,
  type EmailConnection,
  type InsertUser,
  type InsertCustomer, 
  type InsertInvoice, 
  type InsertEmailTemplate, 
  type InsertNudgeSchedule, 
  type InsertActivity, 
  type InsertNudgeSettings,
  type InsertEmailConnection
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";

export interface IStorage {
  sessionStore: session.Store;

  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  updateUserStripeInfo(id: number, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User | undefined>;
  setResetToken(id: number, token: string, expiry: Date): Promise<User | undefined>;
  clearResetToken(id: number): Promise<User | undefined>;

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

  // Email Connections
  getEmailConnections(userId: number): Promise<EmailConnection[]>;
  getEmailConnection(id: number): Promise<EmailConnection | undefined>;
  getActiveEmailConnection(userId: number): Promise<EmailConnection | undefined>;
  createEmailConnection(connection: InsertEmailConnection): Promise<EmailConnection>;
  updateEmailConnection(id: number, connection: Partial<InsertEmailConnection>): Promise<EmailConnection | undefined>;
  deleteEmailConnection(id: number): Promise<boolean>;

  // Dashboard metrics
  getDashboardMetrics(): Promise<{
    outstandingInvoices: number;
    outstandingValue: number;
    responseRate: number;
    nudgesSent: number;
    avgCollectionTime: number;
  }>;
}

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  public sessionStore: session.Store;
  private users: Map<number, User>;
  private customers: Map<number, Customer>;
  private invoices: Map<number, Invoice>;
  private emailTemplates: Map<number, EmailTemplate>;
  private nudgeSchedules: Map<number, NudgeSchedule>;
  private activities: Map<number, Activity>;
  private nudgeSettings: NudgeSettings;
  private currentId: { [key: string]: number };

  constructor() {
    this.sessionStore = new MemoryStore({ checkPeriod: 86400000 });
    this.users = new Map();
    this.customers = new Map();
    this.invoices = new Map();
    this.emailTemplates = new Map();
    this.nudgeSchedules = new Map();
    this.activities = new Map();
    this.currentId = {
      users: 1,
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

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.resetToken === token && user.resetTokenExpiry && new Date() < user.resetTokenExpiry);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
      firstName: insertUser.firstName ?? null,
      lastName: insertUser.lastName ?? null,
      stripeCustomerId: insertUser.stripeCustomerId ?? null,
      stripeSubscriptionId: insertUser.stripeSubscriptionId ?? null,
      subscriptionStatus: insertUser.subscriptionStatus ?? "inactive",
      resetToken: null,
      resetTokenExpiry: null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updated = { ...user, ...updateData };
    this.users.set(id, updated);
    return updated;
  }

  async updateUserStripeInfo(id: number, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updated = { ...user, stripeCustomerId, stripeSubscriptionId, subscriptionStatus: "active" };
    this.users.set(id, updated);
    return updated;
  }

  async setResetToken(id: number, token: string, expiry: Date): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updated = { ...user, resetToken: token, resetTokenExpiry: expiry };
    this.users.set(id, updated);
    return updated;
  }

  async clearResetToken(id: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updated = { ...user, resetToken: null, resetTokenExpiry: null };
    this.users.set(id, updated);
    return updated;
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
      address: insertCustomer.address ?? null,
      phone: insertCustomer.phone ?? null,
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
      status: insertInvoice.status ?? "pending",
      description: insertInvoice.description ?? null,
      paidDate: insertInvoice.paidDate ?? null,
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
      isActive: insertTemplate.isActive ?? null,
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
      status: insertSchedule.status ?? "scheduled",
      sentDate: insertSchedule.sentDate ?? null,
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
      customerId: insertActivity.customerId ?? null,
      invoiceId: insertActivity.invoiceId ?? null,
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

    // Calculate actual response rate (will be 0 until email responses are tracked)
    const responseRate = 0;

    return {
      outstandingInvoices: outstandingInvoices.length,
      outstandingValue,
      responseRate,
      nudgesSent,
      avgCollectionTime: Math.round(avgCollectionTime),
    };
  }
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({ checkPeriod: 86400000 });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.resetToken, token));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updateUser: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updateUser).where(eq(users.id, id)).returning();
    return user;
  }

  async updateUserStripeInfo(id: number, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ stripeCustomerId, stripeSubscriptionId })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async setResetToken(id: number, token: string, expiry: Date): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ resetToken: token, resetTokenExpiry: expiry })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async clearResetToken(id: number): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ resetToken: null, resetTokenExpiry: null })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Email Connections
  async getEmailConnections(userId: number): Promise<EmailConnection[]> {
    return await db.select().from(emailConnections).where(eq(emailConnections.userId, userId));
  }

  async getEmailConnection(id: number): Promise<EmailConnection | undefined> {
    const [connection] = await db.select().from(emailConnections).where(eq(emailConnections.id, id));
    return connection;
  }

  async getActiveEmailConnection(userId: number): Promise<EmailConnection | undefined> {
    const [connection] = await db.select().from(emailConnections)
      .where(and(eq(emailConnections.userId, userId), eq(emailConnections.isActive, true)));
    return connection;
  }

  async createEmailConnection(insertConnection: InsertEmailConnection): Promise<EmailConnection> {
    const [connection] = await db.insert(emailConnections).values(insertConnection).returning();
    return connection;
  }

  async updateEmailConnection(id: number, updateConnection: Partial<InsertEmailConnection>): Promise<EmailConnection | undefined> {
    const [connection] = await db.update(emailConnections)
      .set({ ...updateConnection, updatedAt: new Date() })
      .where(eq(emailConnections.id, id))
      .returning();
    return connection;
  }

  async deleteEmailConnection(id: number): Promise<boolean> {
    const result = await db.delete(emailConnections).where(eq(emailConnections.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db.insert(customers).values(insertCustomer).returning();
    return customer;
  }

  async updateCustomer(id: number, updateCustomer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [customer] = await db.update(customers).set(updateCustomer).where(eq(customers.id, id)).returning();
    return customer;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    const result = await db.delete(customers).where(eq(customers.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }

  async getInvoicesByCustomer(customerId: number): Promise<Invoice[]> {
    return await db.select().from(invoices).where(eq(invoices.customerId, customerId));
  }

  async getOverdueInvoices(): Promise<Invoice[]> {
    const today = new Date();
    return await db.select().from(invoices)
      .where(and(
        lte(invoices.dueDate, today),
        eq(invoices.status, "pending")
      ));
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const [invoice] = await db.insert(invoices).values(insertInvoice).returning();
    return invoice;
  }

  async updateInvoice(id: number, updateInvoice: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const [invoice] = await db.update(invoices).set(updateInvoice).where(eq(invoices.id, id)).returning();
    return invoice;
  }

  async deleteInvoice(id: number): Promise<boolean> {
    const result = await db.delete(invoices).where(eq(invoices.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Email Templates
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return await db.select().from(emailTemplates).orderBy(desc(emailTemplates.createdAt));
  }

  async getEmailTemplate(id: number): Promise<EmailTemplate | undefined> {
    const [template] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id));
    return template;
  }

  async getEmailTemplateByType(type: string): Promise<EmailTemplate | undefined> {
    const [template] = await db.select().from(emailTemplates).where(eq(emailTemplates.type, type));
    return template;
  }

  async createEmailTemplate(insertTemplate: InsertEmailTemplate): Promise<EmailTemplate> {
    const [template] = await db.insert(emailTemplates).values(insertTemplate).returning();
    return template;
  }

  async updateEmailTemplate(id: number, updateTemplate: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined> {
    const [template] = await db.update(emailTemplates).set(updateTemplate).where(eq(emailTemplates.id, id)).returning();
    return template;
  }

  async deleteEmailTemplate(id: number): Promise<boolean> {
    const result = await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Activities
  async getActivities(limit: number = 10): Promise<Activity[]> {
    return await db.select().from(activities).orderBy(desc(activities.createdAt)).limit(limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db.insert(activities).values(insertActivity).returning();
    return activity;
  }

  // Nudge Settings
  async getNudgeSettings(): Promise<NudgeSettings> {
    const [settings] = await db.select().from(nudgeSettings).limit(1);
    if (!settings) {
      // Create default settings
      const [defaultSettings] = await db.insert(nudgeSettings).values({}).returning();
      return defaultSettings;
    }
    return settings;
  }

  async updateNudgeSettings(updateSettings: Partial<InsertNudgeSettings>): Promise<NudgeSettings> {
    let [settings] = await db.select().from(nudgeSettings).limit(1);
    if (!settings) {
      [settings] = await db.insert(nudgeSettings).values(updateSettings).returning();
    } else {
      [settings] = await db.update(nudgeSettings).set(updateSettings).where(eq(nudgeSettings.id, settings.id)).returning();
    }
    return settings;
  }

  // Nudge Schedules
  async getNudgeSchedules(): Promise<NudgeSchedule[]> {
    return await db.select().from(nudgeSchedules).orderBy(desc(nudgeSchedules.createdAt));
  }

  async getNudgeSchedule(id: number): Promise<NudgeSchedule | undefined> {
    const [schedule] = await db.select().from(nudgeSchedules).where(eq(nudgeSchedules.id, id));
    return schedule;
  }

  async getUpcomingNudges(): Promise<NudgeSchedule[]> {
    return await db.select().from(nudgeSchedules)
      .where(and(
        eq(nudgeSchedules.status, "scheduled"),
        lte(nudgeSchedules.scheduledDate, new Date())
      ));
  }

  async createNudgeSchedule(insertSchedule: InsertNudgeSchedule): Promise<NudgeSchedule> {
    const [schedule] = await db.insert(nudgeSchedules).values(insertSchedule).returning();
    return schedule;
  }

  async updateNudgeSchedule(id: number, updateSchedule: Partial<InsertNudgeSchedule>): Promise<NudgeSchedule | undefined> {
    const [schedule] = await db.update(nudgeSchedules).set(updateSchedule).where(eq(nudgeSchedules.id, id)).returning();
    return schedule;
  }

  async deleteNudgeSchedule(id: number): Promise<boolean> {
    const result = await db.delete(nudgeSchedules).where(eq(nudgeSchedules.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Dashboard Metrics
  async getDashboardMetrics(): Promise<{
    outstandingInvoices: number;
    outstandingValue: number;
    responseRate: number;
    nudgesSent: number;
    avgCollectionTime: number;
  }> {
    const allInvoices = await db.select().from(invoices);
    const outstandingInvoices = allInvoices.filter(inv => inv.status !== "paid");
    const outstandingValue = outstandingInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const schedules = await db.select().from(nudgeSchedules)
      .where(and(
        eq(nudgeSchedules.status, "sent"),
        gte(nudgeSchedules.sentDate, thisMonth)
      ));
    const nudgesSent = schedules.length;

    const paidInvoices = allInvoices.filter(inv => inv.status === "paid" && inv.paidDate);
    const avgCollectionTime = paidInvoices.length > 0 
      ? paidInvoices.reduce((sum, inv) => {
          const diffTime = new Date(inv.paidDate!).getTime() - new Date(inv.issueDate).getTime();
          return sum + Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }, 0) / paidInvoices.length
      : 0;

    // Calculate actual response rate (will be 0 until email responses are tracked)
    const responseRate = 0;

    return {
      outstandingInvoices: outstandingInvoices.length,
      outstandingValue,
      responseRate,
      nudgesSent,
      avgCollectionTime: Math.round(avgCollectionTime),
    };
  }
}

export const storage = new DatabaseStorage();
