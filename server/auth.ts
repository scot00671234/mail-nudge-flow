import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

function generateEmailVerificationToken(): string {
  return randomBytes(32).toString("hex");
}

// Email transporter setup
const createEmailTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP configuration missing. Email functionality will be limited.");
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const emailTransporter = createEmailTransporter();

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "dev-session-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: 'Invalid email or password' });
        }
        if (!user.isEmailVerified) {
          return done(null, false, { message: 'Please verify your email before logging in' });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Email verification route
  app.get("/api/verify-email", async (req, res) => {
    try {
      const { token } = req.query;
      if (!token) {
        return res.status(400).json({ message: "Verification token is required" });
      }

      const user = await storage.verifyUserEmail(token as string);
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }

      res.json({ message: "Email verified successfully. You can now log in." });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ message: "Verification failed" });
    }
  });

  // Registration endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Generate email verification token
      const emailVerificationToken = generateEmailVerificationToken();
      const emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // In development mode without SMTP, auto-verify users
      const shouldAutoVerify = process.env.NODE_ENV === 'development' && !emailTransporter;

      const user = await storage.createUser({
        email,
        password: await hashPassword(password),
        firstName,
        lastName,
        emailVerificationToken,
        emailVerificationExpiry,
        isEmailVerified: shouldAutoVerify,
      });

      // Send verification email if SMTP is configured
      if (emailTransporter) {
        try {
          const verificationUrl = `${req.protocol}://${req.get('host')}/api/verify-email?token=${emailVerificationToken}`;
          
          await emailTransporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: "Verify your Flow account",
            html: `
              <h2>Welcome to Flow!</h2>
              <p>Please click the link below to verify your email address:</p>
              <a href="${verificationUrl}">Verify Email</a>
              <p>This link will expire in 24 hours.</p>
            `,
          });
          
          res.status(201).json({ 
            message: "Registration successful. Please check your email to verify your account.",
            user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }
          });
        } catch (emailError) {
          console.error("Email sending failed:", emailError);
          // If email fails, auto-verify in development
          if (process.env.NODE_ENV === 'development') {
            await storage.verifyUserEmail(emailVerificationToken);
            res.status(201).json({ 
              message: "Registration successful. Email verification was skipped in development mode.",
              user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }
            });
          } else {
            throw emailError;
          }
        }
      } else {
        // No email service configured
        if (shouldAutoVerify) {
          res.status(201).json({ 
            message: "Registration successful. You can now log in immediately.",
            user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }
          });
        } else {
          res.status(201).json({ 
            message: "Registration successful, but email verification is required. Please contact support.",
            user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }
          });
        }
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed: " + error.message });
    }
  });

  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Login failed" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        res.status(200).json({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          subscriptionStatus: user.subscriptionStatus,
          isEmailVerified: user.isEmailVerified,
        });
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Get current user
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user!;
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      subscriptionStatus: user.subscriptionStatus,
      isEmailVerified: user.isEmailVerified,
    });
  });

  // Update user profile
  app.put("/api/user/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { firstName, lastName, email } = req.body;
      const userId = req.user!.id;
      
      // Check if email is being changed and if it's already taken
      if (email && email !== req.user!.email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: "Email already in use" });
        }
      }
      
      const updatedUser = await storage.updateUser(userId, { firstName, lastName, email });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        subscriptionStatus: updatedUser.subscriptionStatus,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update profile: " + error.message });
    }
  });

  // Change password
  app.put("/api/user/password", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      
      if (!user || !(await comparePasswords(currentPassword, user.password))) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      const hashedNewPassword = await hashPassword(newPassword);
      await storage.updateUser(userId, { password: hashedNewPassword });
      res.sendStatus(200);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to change password: " + error.message });
    }
  });

  // Password reset request
  app.post("/api/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Don't reveal if email exists for security
        return res.status(200).json({ message: "If an account with that email exists, a reset link has been sent." });
      }

      if (!emailTransporter) {
        return res.status(500).json({ message: "Email service not configured. Please contact support." });
      }

      // Generate reset token
      const resetToken = randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 3600000); // 1 hour from now

      await storage.setResetToken(user.id, resetToken, expiry);

      // Send reset email
      const resetUrl = `${req.protocol}://${req.get("host")}/reset-password?token=${resetToken}`;
      
      await emailTransporter.sendMail({
        from: process.env.SMTP_USER,
        to: user.email,
        subject: "Password Reset - Flow Invoice Management",
        html: `
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your Flow account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      });

      res.status(200).json({ message: "If an account with that email exists, a reset link has been sent." });
    } catch (error: any) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Failed to send reset email" });
    }
  });

  // Password reset confirmation
  app.post("/api/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      
      const user = await storage.getUserByResetToken(token);
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      // Update password and clear reset token
      const hashedPassword = await hashPassword(password);
      await storage.updateUser(user.id, { password: hashedPassword });
      await storage.clearResetToken(user.id);

      res.status(200).json({ message: "Password successfully reset" });
    } catch (error: any) {
      console.error("Password reset confirmation error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Update user profile
  app.put("/api/user/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { firstName, lastName, email } = req.body;
      const user = req.user!;

      // Check if email is already taken by another user
      if (email !== user.email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser && existingUser.id !== user.id) {
          return res.status(400).json({ message: "Email already registered" });
        }
      }

      const updatedUser = await storage.updateUser(user.id, {
        firstName,
        lastName,
        email,
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        subscriptionStatus: updatedUser.subscriptionStatus,
      });
    } catch (error: any) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Change password
  app.put("/api/user/password", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { currentPassword, newPassword } = req.body;
      const user = req.user!;

      // Verify current password
      if (!(await comparePasswords(currentPassword, user.password))) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Update password
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(user.id, { password: hashedPassword });

      res.status(200).json({ message: "Password successfully changed" });
    } catch (error: any) {
      console.error("Password change error:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });
}