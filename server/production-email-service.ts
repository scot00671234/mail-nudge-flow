import { google } from 'googleapis';
import { Client } from '@microsoft/microsoft-graph-client';
import { storage } from './storage';
import nodemailer from 'nodemailer';
import type { EmailConnection, User } from '@shared/schema';

// OAuth Configuration
const GMAIL_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: `${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 'http://localhost:5000'}/api/oauth/gmail/callback`,
  scopes: ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/userinfo.email'],
};

const OUTLOOK_CONFIG = {
  clientId: process.env.MICROSOFT_CLIENT_ID,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  redirectUri: `${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 'http://localhost:5000'}/api/oauth/outlook/callback`,
  scopes: ['https://graph.microsoft.com/Mail.Send', 'https://graph.microsoft.com/User.Read'],
};

export const EMAIL_PROVIDERS = [
  {
    name: 'Gmail',
    provider: 'gmail',
    description: 'Connect your Gmail account to send payment reminders',
    icon: 'mail',
    color: 'bg-red-500',
  },
  {
    name: 'Outlook',
    provider: 'outlook', 
    description: 'Connect your Outlook account to send payment reminders',
    icon: 'mail',
    color: 'bg-blue-500',
  },
];

export class ProductionEmailService {
  private oauth2Client: any;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      GMAIL_CONFIG.clientId,
      GMAIL_CONFIG.clientSecret,
      GMAIL_CONFIG.redirectUri
    );
  }

  // Gmail OAuth Integration
  getGmailAuthUrl(): string {
    if (!GMAIL_CONFIG.clientId || !GMAIL_CONFIG.clientSecret) {
      throw new Error('Gmail OAuth credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.');
    }

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: GMAIL_CONFIG.scopes,
      prompt: 'consent',
    });
  }

  async handleGmailCallback(code: string, userId: number): Promise<EmailConnection> {
    if (!GMAIL_CONFIG.clientId || !GMAIL_CONFIG.clientSecret) {
      throw new Error('Gmail OAuth credentials not configured');
    }

    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);

      // Get user email from Google
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const { data } = await oauth2.userinfo.get();

      if (!data.email) {
        throw new Error('Failed to retrieve email from Gmail account');
      }

      // Save connection to database
      const connection = await storage.createEmailConnection({
        userId,
        provider: 'gmail',
        email: data.email,
        accessToken: tokens.access_token || '',
        refreshToken: tokens.refresh_token || '',
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        isActive: true,
      });

      return connection;
    } catch (error) {
      console.error('Gmail OAuth callback error:', error);
      throw new Error('Failed to complete Gmail authentication');
    }
  }

  // Outlook OAuth Integration
  getOutlookAuthUrl(): string {
    if (!OUTLOOK_CONFIG.clientId) {
      throw new Error('Outlook OAuth credentials not configured. Please set MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET environment variables.');
    }

    const params = new URLSearchParams({
      client_id: OUTLOOK_CONFIG.clientId,
      response_type: 'code',
      redirect_uri: OUTLOOK_CONFIG.redirectUri,
      scope: OUTLOOK_CONFIG.scopes.join(' '),
      response_mode: 'query',
    });

    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
  }

  async handleOutlookCallback(code: string, userId: number): Promise<EmailConnection> {
    if (!OUTLOOK_CONFIG.clientId || !OUTLOOK_CONFIG.clientSecret) {
      throw new Error('Outlook OAuth credentials not configured');
    }

    try {
      // Exchange code for tokens
      const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: OUTLOOK_CONFIG.clientId,
          client_secret: OUTLOOK_CONFIG.clientSecret,
          code,
          redirect_uri: OUTLOOK_CONFIG.redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for tokens');
      }

      const tokens = await tokenResponse.json();

      // Get user email from Microsoft Graph
      const graphClient = Client.init({
        authProvider: {
          getAccessToken: async () => tokens.access_token,
        },
      });

      const user = await graphClient.api('/me').get();
      
      if (!user.mail && !user.userPrincipalName) {
        throw new Error('Failed to retrieve email from Outlook account');
      }

      const email = user.mail || user.userPrincipalName;

      // Save connection to database
      const connection = await storage.createEmailConnection({
        userId,
        provider: 'outlook',
        email,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        isActive: true,
      });

      return connection;
    } catch (error) {
      console.error('Outlook OAuth callback error:', error);
      throw new Error('Failed to complete Outlook authentication');
    }
  }

  // Send emails through connected accounts
  async sendEmailThroughConnection(connectionId: number, to: string, subject: string, body: string): Promise<void> {
    const connection = await storage.getEmailConnection(connectionId);
    if (!connection || !connection.isActive) {
      throw new Error('Email connection not found or inactive');
    }

    // Check if token needs refresh
    if (connection.expiresAt && connection.expiresAt <= new Date()) {
      await this.refreshConnectionToken(connection);
    }

    if (connection.provider === 'gmail') {
      await this.sendGmailMessage(connection, to, subject, body);
    } else if (connection.provider === 'outlook') {
      await this.sendOutlookMessage(connection, to, subject, body);
    } else {
      throw new Error('Unsupported email provider');
    }
  }

  private async sendGmailMessage(connection: EmailConnection, to: string, subject: string, body: string): Promise<void> {
    try {
      this.oauth2Client.setCredentials({
        access_token: connection.accessToken,
        refresh_token: connection.refreshToken,
      });

      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

      const email = [
        `To: ${to}`,
        `From: ${connection.email}`,
        `Subject: ${subject}`,
        '',
        body,
      ].join('\n');

      const base64Email = Buffer.from(email).toString('base64url');

      await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: base64Email,
        },
      });

      console.log(`Email sent successfully via Gmail to ${to}`);
    } catch (error) {
      console.error('Gmail send error:', error);
      throw new Error('Failed to send email via Gmail');
    }
  }

  private async sendOutlookMessage(connection: EmailConnection, to: string, subject: string, body: string): Promise<void> {
    try {
      const graphClient = Client.init({
        authProvider: {
          getAccessToken: async () => connection.accessToken || '',
        },
      });

      const message = {
        subject,
        body: {
          contentType: 'Text',
          content: body,
        },
        toRecipients: [
          {
            emailAddress: {
              address: to,
            },
          },
        ],
      };

      await graphClient.api('/me/sendMail').post({ message });
      console.log(`Email sent successfully via Outlook to ${to}`);
    } catch (error) {
      console.error('Outlook send error:', error);
      throw new Error('Failed to send email via Outlook');
    }
  }

  private async refreshConnectionToken(connection: EmailConnection): Promise<void> {
    if (connection.provider === 'gmail' && connection.refreshToken) {
      try {
        this.oauth2Client.setCredentials({
          refresh_token: connection.refreshToken,
        });

        const { credentials } = await this.oauth2Client.refreshAccessToken();
        
        await storage.updateEmailConnection(connection.id, {
          accessToken: credentials.access_token || '',
          expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
        });
      } catch (error) {
        console.error('Failed to refresh Gmail token:', error);
        // Deactivate connection if refresh fails
        await storage.updateEmailConnection(connection.id, { isActive: false });
        throw new Error('Gmail connection expired. Please reconnect your account.');
      }
    } else if (connection.provider === 'outlook' && connection.refreshToken) {
      try {
        const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: OUTLOOK_CONFIG.clientId!,
            client_secret: OUTLOOK_CONFIG.clientSecret!,
            refresh_token: connection.refreshToken,
            grant_type: 'refresh_token',
          }),
        });

        if (!response.ok) {
          throw new Error('Token refresh failed');
        }

        const tokens = await response.json();
        
        await storage.updateEmailConnection(connection.id, {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || connection.refreshToken,
          expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        });
      } catch (error) {
        console.error('Failed to refresh Outlook token:', error);
        // Deactivate connection if refresh fails
        await storage.updateEmailConnection(connection.id, { isActive: false });
        throw new Error('Outlook connection expired. Please reconnect your account.');
      }
    }
  }

  // Send test email
  async sendTestEmail(connectionId: number, testEmailAddress: string): Promise<void> {
    const connection = await storage.getEmailConnection(connectionId);
    if (!connection) {
      throw new Error('Email connection not found');
    }

    const subject = 'Flow Test Email - Connection Successful!';
    const body = `Hello!

This is a test email from Flow to confirm your email connection is working properly.

✅ Provider: ${connection.provider}
✅ Connected Email: ${connection.email}
✅ Status: Active

You can now use this email account to send payment reminders to your customers.

Best regards,
Flow Team`;

    await this.sendEmailThroughConnection(connectionId, testEmailAddress, subject, body);

    // Update last test sent timestamp
    await storage.updateEmailConnection(connectionId, {
      lastTestSent: new Date(),
    });
  }

  // System email service for authentication emails
  async sendSystemEmail(to: string, subject: string, body: string): Promise<void> {
    // For system emails (password reset, verification), we'll use a simple SMTP setup
    // This can be configured with any SMTP provider in production
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('SMTP not configured. Email would be sent to:', to);
      console.log('Subject:', subject);
      console.log('Body:', body);
      return; // In development, just log the email
    }

    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        text: body,
      });
      console.log(`System email sent to ${to}`);
    } catch (error) {
      console.error('Failed to send system email:', error);
      throw new Error('Failed to send system email');
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(user: User, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 'http://localhost:5000'}/reset-password?token=${resetToken}`;
    
    const subject = 'Reset Your Flow Password';
    const body = `Hello ${user.firstName || user.email},

You requested to reset your password for your Flow account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this password reset, please ignore this email.

Best regards,
Flow Team`;

    await this.sendSystemEmail(user.email, subject, body);
  }

  // Send email verification
  async sendVerificationEmail(user: User, verificationToken: string): Promise<void> {
    const verifyUrl = `${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 'http://localhost:5000'}/verify-email?token=${verificationToken}`;
    
    const subject = 'Verify Your Flow Account';
    const body = `Welcome to Flow, ${user.firstName || user.email}!

Please verify your email address by clicking the link below:
${verifyUrl}

This link will expire in 24 hours.

Once verified, you'll be able to access all Flow features and start managing your invoices and payment reminders.

Best regards,
Flow Team`;

    await this.sendSystemEmail(user.email, subject, body);
  }
}

export const productionEmailService = new ProductionEmailService();