import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status").default("inactive"), // active, inactive, canceled, past_due
  subscriptionPlan: text("subscription_plan", { enum: ["free", "pro", "enterprise"] }).default("free"),
  hideEmailFooter: boolean("hide_email_footer").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  number: text("number").notNull().unique(),
  customerId: integer("customer_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"), // pending, sent, viewed, paid, overdue
  issueDate: timestamp("issue_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // first_reminder, second_reminder, final_notice
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const nudgeSchedules = pgTable("nudge_schedules", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull(),
  templateId: integer("template_id").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  sentDate: timestamp("sent_date"),
  status: text("status").notNull().default("scheduled"), // scheduled, sent, cancelled
  nudgeType: text("nudge_type").notNull(), // first_reminder, second_reminder, final_notice
  createdAt: timestamp("created_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // invoice_created, nudge_sent, payment_received, invoice_overdue
  description: text("description").notNull(),
  invoiceId: integer("invoice_id"),
  customerId: integer("customer_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const nudgeSettings = pgTable("nudge_settings", {
  id: serial("id").primaryKey(),
  firstReminderDays: integer("first_reminder_days").default(7),
  secondReminderDays: integer("second_reminder_days").default(14),
  finalNoticeDays: integer("final_notice_days").default(21),
  autoNudgeEnabled: boolean("auto_nudge_enabled").default(true),
  businessHoursOnly: boolean("business_hours_only").default(true),
  weekdaysOnly: boolean("weekdays_only").default(true),
});

export const emailConnections = pgTable("email_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  provider: text("provider").notNull(), // gmail, outlook
  email: text("email").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  lastTestSent: timestamp("last_test_sent"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  resetToken: true,
  resetTokenExpiry: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
}).extend({
  amount: z.string().transform((val) => parseFloat(val)),
});

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertNudgeScheduleSchema = createInsertSchema(nudgeSchedules).omit({
  id: true,
  createdAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertNudgeSettingsSchema = createInsertSchema(nudgeSettings).omit({
  id: true,
});

export const insertEmailConnectionSchema = createInsertSchema(emailConnections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;

export type NudgeSchedule = typeof nudgeSchedules.$inferSelect;
export type InsertNudgeSchedule = z.infer<typeof insertNudgeScheduleSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type NudgeSettings = typeof nudgeSettings.$inferSelect;
export type InsertNudgeSettings = z.infer<typeof insertNudgeSettingsSchema>;

export type EmailConnection = typeof emailConnections.$inferSelect;
export type InsertEmailConnection = z.infer<typeof insertEmailConnectionSchema>;
