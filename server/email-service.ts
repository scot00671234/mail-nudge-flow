import { google } from 'googleapis';
import { Client } from '@microsoft/microsoft-graph-client';
import { storage } from './storage';
import type { EmailConnection } from '@shared/schema';

export interface EmailProvider {
  name: string;
  displayName: string;
  icon: string;
  scopes: string[];
}

export const EMAIL_PROVIDERS: Record<string, EmailProvider> = {
  gmail: {
    name: 'gmail',
    displayName: 'Gmail',
    icon: '📧',
    scopes: ['https://www.googleapis.com/auth/gmail.send']
  },
  outlook: {
    name: 'outlook',
    displayName: 'Outlook',
    icon: '📧',
    scopes: ['https://graph.microsoft.com/mail.send', 'offline_access']
  }
};

export class EmailService {
  private gmailClient: any;
  private outlookClient: any;

  constructor() {
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      this.gmailClient = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI || `${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}/api/oauth/gmail/callback`
      );
    }
  }

  getGmailAuthUrl(): string {
    if (!this.gmailClient) {
      throw new Error('Gmail OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
    }
    
    return this.gmailClient.generateAuthUrl({
      access_type: 'offline',
      scope: EMAIL_PROVIDERS.gmail.scopes,
      include_granted_scopes: true,
      prompt: 'consent'
    });
  }

  getOutlookAuthUrl(): string {
    if (!process.env.MICROSOFT_CLIENT_ID) {
      throw new Error('Outlook OAuth not configured. Please set MICROSOFT_CLIENT_ID');
    }

    const scopes = EMAIL_PROVIDERS.outlook.scopes.join(' ');
    const redirectUri = process.env.MICROSOFT_REDIRECT_URI || `${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}/api/oauth/outlook/callback`;
    
    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=${process.env.MICROSOFT_CLIENT_ID}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `response_mode=query`;
  }

  async handleGmailCallback(code: string, userId: number): Promise<EmailConnection> {
    if (!this.gmailClient) {
      throw new Error('Gmail OAuth not configured');
    }

    const { tokens } = await this.gmailClient.getToken(code);
    this.gmailClient.setCredentials(tokens);

    // Get user email
    const gmail = google.gmail({ version: 'v1', auth: this.gmailClient });
    const profile = await gmail.users.getProfile({ userId: 'me' });
    const email = profile.data.emailAddress!;

    // Store connection
    const connection = await storage.createEmailConnection({
      userId,
      provider: 'gmail',
      email,
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token || null,
      expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      isActive: true
    });

    return connection;
  }

  async handleOutlookCallback(code: string, userId: number): Promise<EmailConnection> {
    if (!process.env.MICROSOFT_CLIENT_ID || !process.env.MICROSOFT_CLIENT_SECRET) {
      throw new Error('Outlook OAuth not configured');
    }

    const redirectUri = process.env.MICROSOFT_REDIRECT_URI || `${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}/api/oauth/outlook/callback`;
    
    const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        scope: EMAIL_PROVIDERS.outlook.scopes.join(' ')
      })
    });

    const tokens = await response.json();
    
    if (!response.ok) {
      throw new Error(`OAuth error: ${tokens.error_description || tokens.error}`);
    }

    // Get user email using Graph API
    const graphClient = Client.init({
      authProvider: (done) => {
        done(null, tokens.access_token);
      }
    });

    const user = await graphClient.api('/me').get();
    const email = user.mail || user.userPrincipalName;

    // Store connection
    const connection = await storage.createEmailConnection({
      userId,
      provider: 'outlook',
      email,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || null,
      expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
      isActive: true
    });

    return connection;
  }

  async sendTestEmail(connectionId: number, toEmail: string): Promise<boolean> {
    const connection = await storage.getEmailConnection(connectionId);
    if (!connection || !connection.isActive) {
      throw new Error('Email connection not found or inactive');
    }

    const subject = 'Flow Test Email - Connection Successful! 🎉';
    const body = `
Hi there!

Great news! Your ${connection.provider === 'gmail' ? 'Gmail' : 'Outlook'} connection is working perfectly.

This test email confirms that Flow can now send payment reminders on your behalf using ${connection.email}.

Here's what happens next:
• Flow will automatically send reminders when invoices become overdue
• All emails will appear to come from your email address
• You can edit reminder messages anytime in your settings
• You can disconnect this email anytime

Ready to get paid faster? 💰

Best regards,
Your Flow Team

P.S. You can disable these test emails in your settings.
    `.trim();

    try {
      if (connection.provider === 'gmail') {
        await this.sendGmailEmail(connection, toEmail, subject, body);
      } else if (connection.provider === 'outlook') {
        await this.sendOutlookEmail(connection, toEmail, subject, body);
      }

      // Update last test sent
      await storage.updateEmailConnection(connectionId, {
        lastTestSent: new Date()
      });

      return true;
    } catch (error) {
      console.error('Test email failed:', error);
      throw error;
    }
  }

  private async sendGmailEmail(connection: EmailConnection, to: string, subject: string, body: string): Promise<void> {
    if (!this.gmailClient) {
      throw new Error('Gmail client not configured');
    }

    this.gmailClient.setCredentials({
      access_token: connection.accessToken,
      refresh_token: connection.refreshToken
    });

    const gmail = google.gmail({ version: 'v1', auth: this.gmailClient });
    
    const email = [
      `To: ${to}`,
      `From: ${connection.email}`,
      `Subject: ${subject}`,
      '',
      body
    ].join('\n');

    const base64Email = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: base64Email
      }
    });
  }

  private async sendOutlookEmail(connection: EmailConnection, to: string, subject: string, body: string): Promise<void> {
    const graphClient = Client.init({
      authProvider: (done) => {
        done(null, connection.accessToken);
      }
    });

    const message = {
      message: {
        subject,
        body: {
          contentType: 'Text',
          content: body
        },
        toRecipients: [
          {
            emailAddress: {
              address: to
            }
          }
        ]
      }
    };

    await graphClient.api('/me/sendMail').post(message);
  }
}

export const emailService = new EmailService();