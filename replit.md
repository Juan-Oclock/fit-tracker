# FitTracker - Modern Workout Tracker

## Overview

FitTracker is a modern, full-stack workout tracking application built with React, Express, and PostgreSQL. It provides users with a comprehensive fitness tracking experience including workout creation, exercise management, progress monitoring, and analytics. The application is designed as a Progressive Web App (PWA) with offline capabilities and a responsive, mobile-first design.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Theme System**: Context-based dark/light mode theming
- **PWA Features**: Service worker for offline caching, manifest for app installation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful API with JSON responses
- **Build System**: Vite for frontend, esbuild for backend production builds

### Data Storage
- **Database**: PostgreSQL via Supabase with automatic fallback to in-memory storage
- **Schema Management**: Drizzle ORM with custom table creation for Supabase compatibility
- **Connection**: Direct connection using @neondatabase/serverless driver
- **Storage Pattern**: Adaptive storage that switches between PostgreSQL and memory based on DATABASE_URL validity
- **Local Storage**: Browser localStorage for offline data and user preferences

## Key Components

### Database Schema
- **exercises**: Exercise definitions with categories, muscle groups, instructions
- **workouts**: Workout sessions with metadata (name, date, duration, category)
- **workout_exercises**: Junction table linking workouts to exercises with sets/reps
- **personal_records**: User's best performances for tracking progress

### API Endpoints
- **Exercises**: CRUD operations, search, category filtering
- **Workouts**: Create, read, update, delete workout sessions
- **Workout Exercises**: Manage exercise entries within workouts
- **Personal Records**: Track and retrieve fitness milestones
- **Analytics**: Workout statistics and progress data

### Frontend Pages
- **Dashboard**: Overview with stats, quick actions, recent workouts
- **New Workout**: Workout creation interface with exercise selection
- **History**: Past workout browsing with filtering and search
- **Exercises**: Exercise database with categorization and search
- **Progress**: Analytics and progress tracking visualizations
- **Settings**: User preferences and app configuration

### UI Component System
- Design system based on neutral color palette with blue accent
- Consistent spacing and typography using Tailwind utilities
- Responsive design with mobile-first approach
- Dark mode support throughout the application
- Accessible components using Radix UI primitives

## Data Flow

1. **User Interaction**: User interacts with React components
2. **State Management**: TanStack Query manages server state and caching
3. **API Requests**: HTTP requests sent to Express backend
4. **Database Operations**: Drizzle ORM performs type-safe database queries
5. **Response Handling**: JSON responses processed and cached by React Query
6. **UI Updates**: Components re-render with updated data
7. **Offline Support**: Service worker caches responses for offline access

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection driver
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight React router

### Development Tools
- **drizzle-kit**: Database migration and introspection tool
- **tsx**: TypeScript execution for development
- **vite**: Frontend build tool and development server
- **esbuild**: Fast JavaScript bundler for production builds

### PWA Features
- **Service Worker**: Custom caching strategy for offline functionality
- **Web App Manifest**: App installation and native-like experience
- **Local Storage**: Client-side data persistence

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with HMR and React Fast Refresh
- **Backend**: tsx for TypeScript execution with auto-reload
- **Database**: Drizzle Kit for schema management and migrations

### Production Build Process
1. **Frontend**: Vite builds optimized static assets
2. **Backend**: esbuild bundles Node.js application
3. **Database**: Migrations applied via drizzle-kit
4. **Static Assets**: Served by Express in production

### Environment Configuration
- **Database URL**: PostgreSQL connection string
- **Build Outputs**: 
  - Frontend assets to `dist/public`
  - Backend bundle to `dist/index.js`

## Changelog
- July 11, 2025: Restricted admin interface to development environment only for security
- July 11, 2025: Added workout photo thumbnails to history with lightbox view for full-size images
- July 11, 2025: Improved mobile layout for workout history - date and time display cleanly separated
- July 11, 2025: Added workout selfie upload feature with automatic image compression (600px max, ~50KB target)
- July 11, 2025: Fixed mobile layout overlap issue with goal setting button
- July 11, 2025: Added dynamic weekly goal setting system - users can set workout goals (1-14 per week) that update once weekly
- July 11, 2025: Made dashboard statistics dynamic - removed hardcoded percentages when no data exists, replaced with encouraging messages
- July 11, 2025: Added comprehensive admin interface with tabbed navigation for managing exercises, categories, and muscle groups
- July 11, 2025: Improved workout creation UX with side-by-side exercise image and instructions layout
- July 11, 2025: Added white background for exercise images to ensure visibility in dark mode
- July 11, 2025: Fixed static asset serving for exercise images in development environment
- July 10, 2025: Enhanced exercise image system with fast-loading local assets for instant visual identification
- July 10, 2025: Added exercise image support with URL field for visual exercise library
- July 10, 2025: Built comprehensive admin interface for exercise database management (add/edit exercises)
- July 10, 2025: Integrated exercises directly into workout creation with detailed tracking (sets, reps, weight, notes)
- July 10, 2025: Successfully completed full Supabase authentication integration
- July 10, 2025: Fixed Google OAuth redirect configuration and removed development preview warnings
- July 10, 2025: Integrated backend authentication middleware with JWT token verification
- July 10, 2025: Replaced Replit Auth with Supabase Auth system (email/password + Google OAuth)
- July 10, 2025: Enhanced mobile responsiveness with bottom navigation and touch-friendly interface  
- July 07, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.
App branding: Replace Supabase domain display with real domain name in OAuth flow.
Development experience: Remove "temporary development preview" warnings.
Custom domain: fittracker.juan-oclock.com (maintain custom domain during auth flows)

## Required Supabase Configuration for Custom Domain

To fix the OAuth flow showing Supabase URLs instead of your custom domain:

### Steps to Update Supabase Settings:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/_/settings/auth)
2. Navigate to Authentication → Settings
3. Update these fields:
   - **Site URL**: `https://fittracker.juan-oclock.com`
   - **Redirect URLs**: Add `https://fittracker.juan-oclock.com/**`
4. Save changes

### Current Issue:
- Google OAuth shows `vngkmywbnlhwqpcxrhky.supabase.co` 
- Should show `fittracker.juan-oclock.com` instead
- **Root Cause**: Google Cloud Console OAuth app configuration (not Supabase settings)
- **Status**: Google Cloud Console updated but changes can take 24-48 hours to propagate

### Additional Required: Google Cloud Console Configuration
**Note**: The domain display in Google OAuth is controlled by Google Cloud Console, not Supabase.

1. Access [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **OAuth consent screen**
3. Update:
   - **Application name**: "FitTracker"
   - **Authorized domains**: Add `juan-oclock.com`
4. Navigate to **APIs & Services** → **Credentials** 
5. Update OAuth 2.0 client ID:
   - **Authorized redirect URIs**: `https://fittracker.juan-oclock.com/auth/callback`
6. **Publish the app**: Change status from "Testing" to "In production"
   - Click "Publish app" button to allow public access
   - Testing mode limits OAuth to 100 test users only

### Troubleshooting OAuth Domain Display:
- **Propagation Time**: Google OAuth changes take 24-48 hours to show globally
- **Browser Cache**: Try incognito/private browsing mode
- **Alternative**: Create new OAuth client ID in Google Cloud Console with correct domain
- **Current Status**: Changes made but still showing Supabase URL (normal during propagation period)

## Authentication Status
✓ Email/password authentication - Working
✓ Google OAuth authentication - Working  
✓ Backend API authentication - Working
✓ JWT token verification - Working
✓ User session management - Working