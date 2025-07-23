import { storage } from "./storage";
import type { User } from "@shared/schema";

/**
 * Email Footer Service
 * Manages the "Powered by Flow" footer based on user subscription plans
 */

export class EmailFooterService {
  private static readonly FOOTER_HTML = `
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280;">
      <p style="margin: 0;">
        Powered by <a href="https://invoicenudgerflow.com" style="color: #3b82f6; text-decoration: none;">Flow</a> – invoicenudgerflow.com
      </p>
    </div>
  `;

  private static readonly FOOTER_TEXT = `

---
Powered by Flow – invoicenudgerflow.com
`;

  /**
   * Checks if a user should have the footer included in their emails
   */
  static async shouldIncludeFooter(userId: number): Promise<boolean> {
    const user = await storage.getUser(userId);
    if (!user) {
      return true; // Default to including footer for unknown users
    }

    // Free users always get the footer
    if (user.subscriptionPlan === "free") {
      return true;
    }

    // Pro and Enterprise users can opt out if they have hideEmailFooter set
    if (user.subscriptionPlan === "pro" || user.subscriptionPlan === "enterprise") {
      return !user.hideEmailFooter;
    }

    // Default to including footer
    return true;
  }

  /**
   * Checks if a user can toggle the footer setting
   */
  static async canToggleFooter(userId: number): Promise<boolean> {
    const user = await storage.getUser(userId);
    if (!user) {
      return false;
    }

    return user.subscriptionPlan === "pro" || user.subscriptionPlan === "enterprise";
  }

  /**
   * Adds the Flow footer to an HTML email if required
   */
  static async addFooterToHtml(emailHtml: string, userId: number): Promise<string> {
    const shouldInclude = await this.shouldIncludeFooter(userId);
    
    if (!shouldInclude) {
      return emailHtml;
    }

    // Try to find the closing body tag
    const bodyClosingIndex = emailHtml.lastIndexOf('</body>');
    if (bodyClosingIndex !== -1) {
      return emailHtml.slice(0, bodyClosingIndex) + 
             this.FOOTER_HTML + 
             emailHtml.slice(bodyClosingIndex);
    }

    // If no body tag, append to the end
    return emailHtml + this.FOOTER_HTML;
  }

  /**
   * Adds the Flow footer to a plain text email if required
   */
  static async addFooterToText(emailText: string, userId: number): Promise<string> {
    const shouldInclude = await this.shouldIncludeFooter(userId);
    
    if (!shouldInclude) {
      return emailText;
    }

    return emailText + this.FOOTER_TEXT;
  }

  /**
   * Updates user's footer preference (only allowed for Pro/Enterprise)
   */
  static async updateFooterPreference(userId: number, hideFooter: boolean): Promise<{ success: boolean; message: string }> {
    const canToggle = await this.canToggleFooter(userId);
    
    if (!canToggle) {
      return {
        success: false,
        message: "Footer settings are only available for Pro and Enterprise plans. Upgrade to customize your email branding."
      };
    }

    const updatedUser = await storage.updateUser(userId, { hideEmailFooter: hideFooter });
    
    if (!updatedUser) {
      return {
        success: false,
        message: "Failed to update footer preference"
      };
    }

    return {
      success: true,
      message: hideFooter ? "Footer hidden from future emails" : "Footer will appear on future emails"
    };
  }

  /**
   * Enforces footer visibility when a user downgrades their plan
   */
  static async handlePlanDowngrade(userId: number, newPlan: string): Promise<void> {
    if (newPlan === "free") {
      // Force footer to be visible for free users
      await storage.updateUser(userId, { 
        subscriptionPlan: newPlan as any,
        hideEmailFooter: false 
      });
    } else {
      // Just update the plan for Pro/Enterprise
      await storage.updateUser(userId, { 
        subscriptionPlan: newPlan as any
      });
    }
  }

  /**
   * Gets footer configuration for a user
   */
  static async getFooterConfig(userId: number): Promise<{
    shouldIncludeFooter: boolean;
    canToggleFooter: boolean;
    currentSetting: boolean;
    plan: string;
  }> {
    const user = await storage.getUser(userId);
    
    if (!user) {
      return {
        shouldIncludeFooter: true,
        canToggleFooter: false,
        currentSetting: false,
        plan: "free"
      };
    }

    return {
      shouldIncludeFooter: await this.shouldIncludeFooter(userId),
      canToggleFooter: await this.canToggleFooter(userId),
      currentSetting: user.hideEmailFooter,
      plan: user.subscriptionPlan
    };
  }
}

// Helper function to format email with footer
export async function formatEmailWithFooter(
  emailContent: { html?: string; text?: string }, 
  userId: number
): Promise<{ html?: string; text?: string }> {
  const result: { html?: string; text?: string } = {};

  if (emailContent.html) {
    result.html = await EmailFooterService.addFooterToHtml(emailContent.html, userId);
  }

  if (emailContent.text) {
    result.text = await EmailFooterService.addFooterToText(emailContent.text, userId);
  }

  return result;
}