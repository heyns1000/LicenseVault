# FAA™ Brand Licensing System

## Overview

This is a full-stack web application for managing FAA™ brand licensing with a modern React frontend and Express.js backend. The system features a comprehensive brand catalog, licensing calculator, and dashboard with analytics. It uses PostgreSQL database (Neon) for data storage via Drizzle ORM and includes Replit authentication for user management.

## Recent Changes

- **July 24, 2025**: Successfully integrated PostgreSQL database using Neon
  - Database connection established via `@neondatabase/serverless`
  - All schema tables created and synchronized
  - DatabaseStorage class fully implemented and operational
  - All TypeScript errors resolved
  - Application running successfully on port 5000 with working database connectivity

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with separate client and server directories, sharing common schema definitions. It uses a modern full-stack JavaScript/TypeScript architecture with the following key components:

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development/building
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom FAA brand theming
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit OpenID Connect integration
- **Session Management**: Express session with PostgreSQL store

## Key Components

### Database Schema
The system uses a PostgreSQL database with the following main entities:
- **Users**: Authentication and profile information (required for Replit Auth)
- **Organizations**: Company/agency management
- **Brands**: Trademarked brand catalog with tier-based pricing
- **Licenses**: License agreements and calculations
- **Sessions**: Session storage for authentication
- **Brand Metrics**: Analytics and performance tracking

### Brand Tiers
The system implements a four-tier brand hierarchy:
- **Sovereign**: Premium tier (Crown icon, yellow theme)
- **Dynastic**: Executive tier (King icon, gray theme)  
- **Operational**: Standard tier (Tower icon, blue theme)
- **Market**: Basic tier (Leaf icon, green theme)

### Geographic Divisions
Brands are organized by geographic divisions (A-G) representing different global regions including North America, Europe, Asia-Pacific, MENA, Sub-Saharan, LATAM, and Interstellar.

## Data Flow

1. **Authentication**: Users authenticate via Replit OpenID Connect
2. **Dashboard**: Authenticated users see metrics, brand catalog, and filters
3. **Brand Catalog**: Users can browse, search, and filter 4,643+ brands
4. **License Calculator**: Users can calculate licensing costs for selected brands
5. **Brand Details**: Detailed view of individual brands with integration information

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **@radix-ui/react-***: UI component primitives
- **@tanstack/react-query**: Server state management
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### Authentication
- **openid-client**: OpenID Connect client for Replit auth
- **passport**: Authentication middleware

### Development Tools
- **Vite**: Frontend build tool and dev server
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Backend bundling for production

## Deployment Strategy

### Development
- Frontend served by Vite dev server with HMR
- Backend runs with tsx for TypeScript execution
- Database migrations via Drizzle Kit
- Replit-specific development tooling integration

### Production
- Frontend built to static assets via Vite
- Backend bundled with ESBuild for Node.js deployment
- Database schema managed via Drizzle migrations
- Environment variables for database and authentication configuration

### Build Process
1. Frontend: `vite build` outputs to `dist/public`
2. Backend: `esbuild` bundles server to `dist/index.js`
3. Database: `drizzle-kit push` for schema updates
4. Production: Single Node.js process serves both API and static files

The system is designed for deployment on Replit with built-in support for their authentication system and development environment, but can be adapted for other platforms by replacing the auth provider.