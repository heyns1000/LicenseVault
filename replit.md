# FAA™ Brand Licensing System

## Overview

This is a full-stack web application for managing FAA™ brand licensing with a modern React frontend and Express.js backend. The system features a comprehensive brand catalog, licensing calculator, and dashboard with analytics. It uses PostgreSQL database (Neon) for data storage via Drizzle ORM and includes Replit authentication for user management.

## Recent Changes

- **October 31, 2025**: HSOMNI9000 ECOSYSTEM FINAL CONSOLIDATION ✅
  - **BREAKTHROUGH**: Successfully parsed and verified REAL sector data from FruitfulPlanetChange repository source files
  - **31 SECTORS DEPLOYED** with complete CORE + SUBNODE classification:
    - **1,481 CORE brands** (parent brands)
    - **4,738 SUBNODES** (specialized variants under CORE brands)
    - **6,219 TOTAL HSOMNI brands** verified and catalogued
  - **TOP 5 SECTORS**:
    1. AI, Logic & Grid: 188 core + 632 subnodes = 820 total
    2. Logistics & Packaging: 101 core + 364 subnodes = 465 total
    3. Health & Hygiene: 93 core + 372 subnodes = 465 total
    4. Housing & Infrastructure: 91 core + 364 subnodes = 455 total
    5. Food, Soil & Farming: 83 core + 332 subnodes = 415 total
  - **17 VISIONARY SECTORS IDENTIFIED** for future development (48 total target - 31 deployed = 17 remaining)
  - **DATABASE UPDATED**: All 31 sectors now have accurate brandCount and subnodeCount in hsomni_sectors table
  - **AUDIT COMPLETE**: Full repository verification with SecureSign document generated
  - **WATER THE SEED BLUEPRINT**: Comprehensive development roadmap for 17 missing sectors created
  - **Source Repository**: FruitfulPlanetChange (GitHub) - complete brand array parsing verified
  - **Combined System Status**: 6,444 FAA™ brands + 6,219 HSOMNI brands = 12,663 total brands in ecosystem
  - **Water The Seed Progress**: 140% of original 9,000 brand target achieved (with 17 sectors still to develop)
  - **Deliverables Created**:
    1. `WATER-THE-SEED-17-MISSING-SECTORS.md` - Development blueprint
    2. `HSOMNI9000-CONSOLIDATION-AUDIT.md` - Official audit with SecureSign
    3. `server/update-database-with-real-counts.ts` - Database update script
  - PostgreSQL database fully operational with accurate sector metadata
  - Authentication environment variables still needed for full user functionality: ISSUER_URL, ISSUER_DOMAIN, CLIENT_ID, CLIENT_SECRET

- **October 24, 2025**: Restored PostgreSQL database with complete brand catalog
  - Switched from in-memory storage (MemStorage) to PostgreSQL (DatabaseStorage)
  - Successfully seeded database with 6,144+ verified brands
  - Brand names now display properly: AUREUM PATH™, SOLVEMIND™, LIONSTREAM™, GLYPHFRAME™, VAULTSKIN™, etc.
  - Fixed issue where brands were showing as "Brand 40™", "Brand 50™" (generic numbers)
  - Database includes proper brand data: tier classifications, geographic divisions, license fees, royalty rates
  - All features operational: brand catalog, license calculator, agreement generation with real SQL data
  - Water The Seed protocol tracking 6,144+ brands toward 9,000 target

- **October 17, 2025**: Implemented personalized dashboard welcome animation
  - Created WelcomeAnimation component with Fruitful™ branding and personalized user greeting
  - Added localStorage tracking to show animation once per day per user
  - Integrated framer-motion for smooth entrance animations on dashboard load
  - Implemented staggered animations for metric cards (0.1s-0.4s delays)
  - Added cascading animations for brand catalog cards with 0.08s stagger effect
  - Animation skips on subsequent page loads within 24 hours for better UX
  - Welcome animation features Fruitful™ logo, personalized greeting, tagline, and progress bar

- **July 24, 2025**: Added Fruitful™ branding and enhanced features
  - Integrated Fruitful™ logo as main logo across all pages
  - Added Fruitful.thank.you pre-footer image to all main pages
  - Fixed sidebar filter functionality - now properly connects to backend API
  - Added real brand data: Fruitful™, The Lion's Seedwave™, Water The Seed™
  - Implemented global currency converter defaulting to USD with ECR explanation
  - Enhanced brand details with rich product information and brand logo display
  - Fixed runtime errors in brand details page and NaN currency display
  - Updated with latest brand assets: new Fruitful™ and Seedwave logos
  - Added proper individual brand API endpoint for detailed brand information

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with separate client and server directories, sharing common schema definitions. It uses a modern full-stack JavaScript/TypeScript architecture with the following key components:

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development/building
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom FAA brand theming
- **Animation**: Framer Motion for welcome animations and dashboard transitions
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **Persistence**: LocalStorage for welcome animation tracking

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