# Flow - Invoice Nudging Application

## Overview

Flow is a modern full-stack web application designed to automate and manage invoice payment reminders (nudges). The system helps businesses track outstanding invoices, manage customer relationships, and automate payment reminder workflows through email templates and scheduling.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### January 23, 2025 - UX Simplification Update
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