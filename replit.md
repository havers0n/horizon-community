# replit.md

## Overview

This is a full-stack web application built with a React frontend and Express.js backend, designed as a department management system for roleplaying game organizations (like GTA RP servers). The application enables users to manage departments, submit applications, handle support tickets, and manage complaints within a structured organizational hierarchy.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, built with Vite
- **UI Library**: shadcn/ui components based on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Build Tool**: ESBuild for production builds

## Key Components

### Database Schema
The application uses PostgreSQL with the following main entities:
- **Users**: Core user information with roles (candidate, member, supervisor, admin), departments, ranks, and warnings
- **Departments**: Organizational units with names, descriptions, and galleries
- **Applications**: Various types of requests (promotions, transfers, qualifications, etc.)
- **Support Tickets**: Help desk system with message threading
- **Complaints**: Incident reporting system with evidence tracking
- **Reports**: Administrative reporting functionality
- **Notifications**: User notification system
- **Tests**: Assessment and qualification system

### Authentication & Authorization
- JWT token-based authentication stored in localStorage
- Role-based access control with four levels: candidate, member, supervisor, admin
- Protected routes with middleware for supervisor/admin-only features
- Password hashing using bcrypt

### User Interface Components
- Responsive design with mobile-first approach
- Dark/light theme support via CSS variables
- Comprehensive form handling with validation
- Modal dialogs for creating applications, complaints, and support tickets
- Data tables with sorting and filtering capabilities
- Dashboard with statistics and recent activity

## Data Flow

1. **Authentication Flow**: Users register/login → JWT token issued → Token stored locally → Used for API requests
2. **Application Flow**: User creates application → Submitted to backend → Supervisors review → Status updated → User notified
3. **Support Flow**: User creates ticket → Routed to support staff → Messages exchanged → Ticket resolved
4. **Department Management**: Admin creates departments → Users can view/join → Applications processed by department supervisors

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Hook Form)
- UI libraries (Radix UI, Lucide React, Class Variance Authority)
- Utilities (date-fns, clsx, tailwind-merge)
- Build tools (Vite, TypeScript, Tailwind CSS)
- TanStack Query for data fetching

### Backend Dependencies
- Express.js framework
- Database tools (Drizzle ORM, Neon Database client)
- Authentication (bcrypt, jsonwebtoken)
- Development tools (tsx, esbuild)

### Development Tools
- TypeScript for type safety
- ESLint and Prettier for code quality
- Vite for fast development builds
- Drizzle Kit for database migrations

## Deployment Strategy

### Development Environment
- Frontend served by Vite dev server with HMR
- Backend runs with tsx for TypeScript execution
- Database migrations handled by Drizzle Kit
- Environment variables for database connection

### Production Build Process
1. Frontend built with Vite → Static files in `dist/public`
2. Backend bundled with ESBuild → Single file in `dist/index.js`
3. Database schema pushed to production database
4. Static files served by Express in production

### Environment Configuration
- `NODE_ENV` for environment detection
- `DATABASE_URL` for PostgreSQL connection
- `JWT_SECRET` for token signing
- `REPL_ID` for Replit-specific features

## Changelog

```
Changelog:
- July 01, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```