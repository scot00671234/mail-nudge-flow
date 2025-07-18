import type { Customer, Invoice, EmailTemplate, NudgeSchedule, Activity, NudgeSettings } from "@shared/schema";

export interface DashboardMetrics {
  outstandingInvoices: number;
  outstandingValue: number;
  responseRate: number;
  nudgesSent: number;
  avgCollectionTime: number;
}

export interface InvoiceWithCustomer extends Invoice {
  customer?: Customer;
}

export interface NudgeScheduleWithInvoice extends NudgeSchedule {
  invoice?: Invoice;
  customer?: Customer;
}

export { 
  type Customer, 
  type Invoice, 
  type EmailTemplate, 
  type NudgeSchedule, 
  type Activity, 
  type NudgeSettings 
};
