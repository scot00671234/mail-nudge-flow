# Flow - Invoice Nudging Application

## Overview

Flow is a modern full-stack web application designed to automate and manage invoice payment reminders (nudges). The system helps businesses track outstanding invoices, manage customer relationships, and automate payment reminder workflows through email templates and scheduling.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### January 29, 2025 - Complete Dashboard Redesign & Full Invoice Management System ✓
- **Removed sidebar and created comprehensive single-page dashboard**:
  - Eliminated navigation complexity by integrating all functionality into one interface
  - Created professional, glass morphism design with Vercel-inspired aesthetics
  - Implemented complete invoice nudging workflow in organized sections
- **Built comprehensive invoice management system**:
  - Quick stats overview with key metrics display
  - Recent invoices section with status tracking and creation workflow
  - Customer management with overview and quick add functionality
  - Email connection status with setup integration
  - Complete email flow setup widget for payment reminders
- **Enhanced user experience with professional design**:
  - Glass morphism effects with backdrop blur and smooth animations
  - Gradient text headers and hover effects throughout interface
  - Organized grid layout with responsive design for all screen sizes
  - Integrated dialogs for creating invoices, adding customers, and email setup
  - Clean spacing and minimalist aesthetic following modern design principles
- **Complete invoice nudging functionality**:
  - Invoice creation with customer details, amounts, and due dates
  - Customer database management with contact information
  - Email setup and connection management for automated reminders
  - Payment flow configuration with multiple reminder templates
  - Status tracking for all invoices (pending, sent, viewed, paid, overdue)

### January 29, 2025 - Previous Customizable Dashboard Implementation ✓
- **Successfully completed migration from Replit Agent to Replit environment**:
  - All required packages installed and dependencies resolved
  - Project workflow running successfully on Replit infrastructure
  - Application verified as fully functional and user-ready
- **Implemented revolutionary drag-and-drop customizable dashboard**:
  - Complete dashboard transformation based on user feedback for simplicity
  - Drag-and-drop widget system using @dnd-kit for intuitive customization
  - Pre-built widget library with metrics, email status, activity feeds, and quick actions
  - Widget selector with visual indicators for already-added components
  - Email flow setup widget with step-by-step reminder configuration
  - Visual feedback with colors, badges, and smooth animations
  - Responsive grid layout adapting to different screen sizes
- **Enhanced user experience with simplified interface**:
  - Single-page dashboard replacing complex multi-section navigation
  - Visual widget management with hover controls and removal options
  - Contextual email setup guidance and status indicators
  - Progressive disclosure for advanced configuration options
  - Modern, accessible design following current SaaS best practices
- **Interactive widget functionality**:
  - Clickable widgets that open detailed pop-ups with full functionality
  - Comprehensive widget content in expanded view with action buttons
  - Seamless navigation between dashboard overview and detailed actions
  - Simplified navigation reduced to only essential pages (Overview, Invoices, Customers, Email Setup)

### January 24, 2025 - Comprehensive Onboarding System Implementation ✓
- **Successfully completed migration from Replit Agent to Replit environment**:
  - All required packages installed and dependencies resolved
  - Project workflow running successfully on Replit infrastructure
  - Application verified as fully functional and user-ready
- **Implemented revolutionary drag-and-drop customizable dashboard**:
  - Complete dashboard transformation based on user feedback for simplicity
  - Drag-and-drop widget system using @dnd-kit for intuitive customization
  - Pre-built widget library with metrics, email status, activity feeds, and quick actions
  - Widget selector with visual indicators for already-added components
  - Email flow setup widget with step-by-step reminder configuration
  - Visual feedback with colors, badges, and smooth animations
  - Responsive grid layout adapting to different screen sizes
- **Enhanced user experience with simplified interface**:
  - Single-page dashboard replacing complex multi-section navigation
  - Visual widget management with hover controls and removal options
  - Contextual email setup guidance and status indicators
  - Progressive disclosure for advanced configuration options
  - Modern, accessible design following current SaaS best practices

### January 24, 2025 - Comprehensive Onboarding System Implementation ✓
- **Implemented complete first-user experience based on SaaS best practices research**:
  - Interactive welcome modal with clear expectations and progress indicators
  - Progressive onboarding checklist with visual progress tracking and celebration animations
  - Contextual guided tooltips that appear when users need help with specific actions
  - Empty state prompts that highlight the next best action for new users
  - Success celebrations with confetti animations when users complete key milestones
  - Contextual help components providing just-in-time assistance
- **Applied research-driven UX patterns**:
  - Progressive disclosure: Show one key action at a time to avoid overwhelming users
  - Quick wins focus: Get users to create their first invoice within 2 minutes
  - Interactive walkthroughs: Users learn by doing, not passive observation
  - Celebration and gamification: Acknowledge achievements to build engagement
  - Smart empty states: Transform empty dashboards into actionable guidance
- **Enhanced dashboard experience**:
  - Dynamic content based on user progress (empty state vs metrics view)
  - Persistent onboarding checklist for task completion tracking
  - Highlighted primary actions with visual emphasis for new users
  - Integrated help system that can be dismissed but remains accessible
- **Technical implementation features**:
  - Local storage state management for onboarding progress persistence
  - Framer Motion animations for delightful micro-interactions
  - Responsive design ensuring great experience across all devices
  - Type-safe implementation with comprehensive error handling

### January 24, 2025 - Replit Agent Migration Complete ✓
- **Successfully migrated project from Replit Agent to Replit environment**:
  - Fixed WebSocket connection errors with Neon database configuration
  - Implemented dual storage system: DatabaseStorage for production, MemStorage for development
  - Fixed storage initialization to correctly select storage type based on environment
  - Auto-verification for development users when email service unavailable
  - Registration and authentication now working perfectly in development mode
  - Robust error handling for missing email configuration and database unavailability
  - Maintained security practices with proper client/server separation
- **Authentication System Migration**:
- **Migrated from Replit OAuth to email/password authentication**:
  - Removed Replit OpenID Connect integration
  - Implemented traditional email/password login system
  - Added email verification workflow with SMTP support
  - Updated database schema with verification fields
  - Created comprehensive auth page with login/registration forms
- **Fixed landing page issues**:
  - Removed duplicate landing page file
  - Updated "Start Now" button to say "Login" 
  - Fixed all auth buttons to redirect to `/auth` page instead of API endpoints
- **Updated authentication flow**:
  - Users must verify email before logging in
  - Password hashing with scrypt and salt
  - Session-based authentication with PostgreSQL storage
  - Proper error handling for unverified accounts

### January 23, 2025 - UX Simplification & Email Integration Update
- **Migration completed** from Replit Agent to Replit environment
- **Simplified terminology** throughout the application:
  - "Dashboard" → "Overview"
  - "Nudges" → "Payment Reminders" 
  - "Email Templates" → "Reminder Messages"
  - "Analytics" → "Reports"
- **Added comprehensive onboarding** with welcome guide and first invoice prompt
- **Enhanced authentication experience** with user-friendly messaging
- **Improved navigation** with clearer, everyday language in sidebar
- **Created help components** for contextual assistance
- **Added visual guidance** for non-technical users
- **Implemented comprehensive email integration system**:
  - OAuth2 integration with Gmail and Outlook
  - Secure token storage and refresh management
  - User-friendly "One-Click Connect" experience
  - Email connection status dashboard and management
  - Test email functionality with automatic footer integration
- **Built modular email footer system**:
  - Default "Powered by Flow" footer on all emails
  - Plan-based footer control (Pro/Enterprise can toggle off)
  - Automatic enforcement on plan downgrades
  - Comprehensive test coverage and clean architecture

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query (React Query) for server state
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and building

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Validation**: Zod for runtime type checking
- **Session Management**: connect-pg-simple for PostgreSQL session storage

### Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon
- **ORM**: Drizzle ORM for type-safe database operations
- **Migrations**: Drizzle Kit for schema migrations
- **Session Store**: PostgreSQL-backed session storage

## Key Components

### Database Schema
The application uses six main entities:
- **Customers**: Customer information (name, email, phone, address)
- **Invoices**: Invoice details with status tracking (pending, sent, viewed, paid, overdue)
- **Email Templates**: Customizable email templates for different reminder types
- **Nudge Schedules**: Automated scheduling of payment reminders
- **Activities**: Audit trail of system activities
- **Nudge Settings**: Global configuration for nudging behavior

### Core Features
1. **Dashboard**: Overview metrics and recent activity
2. **Invoice Management**: CRUD operations with status tracking
3. **Customer Management**: Customer database with contact information
4. **Email Templates**: Customizable reminder templates with merge fields
5. **Nudge Scheduling**: Automated reminder scheduling based on due dates
6. **Analytics**: Performance tracking and reporting
7. **Settings**: Configurable nudging rules and timing

### UI Components
- Comprehensive design system using Radix UI primitives
- Custom components for forms, tables, modals, and data display
- Responsive layout with mobile-first approach
- Consistent styling through Tailwind CSS variables

## Data Flow

1. **Invoice Creation**: Users can manually create or upload invoices
2. **Customer Association**: Invoices are linked to customers in the database
3. **Automatic Scheduling**: System automatically schedules nudges based on due dates and settings
4. **Email Generation**: Templates are populated with invoice/customer data
5. **Nudge Execution**: Scheduled reminders are sent via email
6. **Status Tracking**: System tracks invoice status changes and payment confirmations
7. **Analytics**: Activity data is aggregated for reporting and insights

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon database client for PostgreSQL
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI component library
- **react-hook-form**: Form handling and validation
- **zod**: Runtime type validation
- **wouter**: Lightweight React router

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Static type checking
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production

### Replit Integration
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Code navigation for Replit

## Deployment Strategy

### Development Environment
- Vite development server with hot module replacement
- TypeScript compilation with strict type checking
- Environment variable configuration for database connections

### Production Build
- Vite builds the frontend to `dist/public`
- ESBuild bundles the backend to `dist/index.js`
- Single production command serves both frontend and API

### Database Management
- Drizzle migrations stored in `./migrations`
- Schema definitions in `shared/schema.ts`
- Database URL configuration via environment variables

### File Structure
```
├── client/          # Frontend React application
├── server/          # Backend Express API
├── shared/          # Shared types and schemas
├── migrations/      # Database migration files
└── dist/           # Production build output
```

The application follows a monorepo structure with clear separation between client, server, and shared code, enabling efficient development and deployment workflows.