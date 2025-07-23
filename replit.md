# Adventures on Wheels - Motorhome Blog

## Overview

Adventures on Wheels is a full-stack blog application built for motorhome enthusiasts. The application features a modern React frontend with TypeScript and a Node.js/Express backend, designed to share travel experiences, mechanical insights, and pet adventures on the road.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI with shadcn/ui components
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Query (@tanstack/react-query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with local database running on same server as application
- **ORM**: Drizzle ORM with schema-first approach
- **Authentication**: OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store
- **File Uploads**: Multer for handling image uploads
- **Email Service**: Nodemailer for contact form submissions

## Key Components

### Database Schema (Initial)
- **Users**: Stores user profiles and permissions
- **Posts**: Blog posts with categories, content, and metadata
- **Contact Submissions**: Form submissions from visitors
- **Newsletter Subscriptions**: Email subscriptions
- **Sessions**: Authentication session storage

### Authentication System
- OpenID Connect
- Admin role management for content creation
- Protected routes for administrative functions
- Session persistence with PostgreSQL

### Blog System
- Category-based organization (Adventures, Mechanical, Dog)
- Rich text editor for content creation
- Featured image uploads
- SEO-friendly slugs
- View tracking and analytics

### Content Management
- WYSIWYG editor with markdown support
- Image upload and management
- Draft/publish workflow
- Admin-only content creation

## Data Flow

1. **User Authentication**: Auth → Session Storage → User Management
2. **Content Creation**: Admin UI → Form Validation → Database Storage
3. **Content Display**: Database Query → API Response → React Components
4. **File Uploads**: Multer → Local Storage → Database Reference
5. **Email Notifications**: Contact Form → Nodemailer → SMTP Service

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **@radix-ui/react-***: UI component primitives
- **@tanstack/react-query**: Server state management
- **drizzle-orm**: Type-safe database operations
- **express**: Web server framework
- **multer**: File upload handling
- **nodemailer**: Email service integration
- **openid-client**: Authentication provider

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and developer experience
- **Tailwind CSS**: Utility-first styling
- **Zod**: Schema validation
- **React Hook Form**: Form state management

## Deployment Strategy

### Build Process
1. Frontend builds to `dist/public` using Vite
2. Backend builds to `dist/index.js` using esbuild
3. Static assets served from built frontend
4. Database migrations handled via Drizzle Kit

### Environment Configuration
- Database connection via `DATABASE_URL`
- Email service via SMTP configuration
- Authentication via Replit Auth environment variables
- Session secrets for security

### Production Considerations
- File uploads currently use local storage (should migrate to cloud storage)
- Email service requires SMTP configuration
- Database requires PostgreSQL provisioning
- SSL/TLS termination handled by deployment platform

## Enhanced Database Features

### Authentication & Security
- **Password Hashing**: bcryptjs implementation with 12 salt rounds
- **Secure Token Generation**: Crypto-based UUID and session tokens
- **User Management**: Enhanced user table with admin roles, email verification, and activity tracking

### Advanced Blog Features
- **Comments System**: Threaded comments with approval workflow
- **Tags System**: Flexible tagging with color coding and slug-based URLs
- **Analytics Tracking**: Comprehensive event tracking (page views, post views, form submissions)
- **Featured Posts**: Ability to mark posts as featured for homepage display
- **Post Likes**: Social engagement tracking for posts

### Database Performance
- **Optimized Indexes**: Automated performance index creation for fast queries
- **Full-Text Search**: PostgreSQL-based search functionality for posts
- **Analytics Dashboard**: Real-time statistics and engagement metrics
- **Data Cleanup**: Automated old data cleanup and maintenance routines

### Scalability Features
- **Session Analytics**: Track user sessions and behavior patterns
- **Newsletter Management**: Enhanced subscription system with unsubscribe tokens
- **Content Management**: Advanced post scheduling and publication workflows
- **Database Utilities**: Backup, maintenance, and performance monitoring tools

## Automated Testing Framework

### Test Coverage
- **Unit Tests**: Schema validation, utility functions, data transformations
- **API Tests**: Authentication, CRUD operations, contact forms, admin features
- **Integration Tests**: Database operations, cross-component functionality
- **End-to-End Tests**: Complete user workflows and blog post lifecycle

### Test Infrastructure
- Jest testing framework with TypeScript support
- Supertest for API endpoint testing
- PostgreSQL test database isolation
- GitHub Actions CI/CD pipeline
- Coverage reporting with HTML and LCOV formats

### Running Tests
- `npm test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage reports
- `npm run test:ci` - CI-optimized test run

### CI/CD Pipeline
- Automated testing on push to main/develop branches
- Multi-Node.js version testing (18.x, 20.x)
- PostgreSQL service integration
- Security audits and dependency checks
- Build artifact generation

## Changelog

- July 07, 2025. Initial setup with basic blog functionality
- July 07, 2025. Enhanced PostgreSQL database with password hashing, analytics, comments, and advanced features
- July 22, 2025. Fixed authentication system bugs: corrected import paths, React hooks errors, and navbar routing. Local authentication now fully functional.
- July 23, 2025. Fixed database connection issues for local deployment: replaced Neon serverless driver with standard pg driver to connect to local PostgreSQL instead of trying WebSocket connections on port 443.
- July 23, 2025. Implemented comprehensive automated testing framework: Added Jest configuration, unit/integration/e2e tests, CI/CD pipeline with GitHub Actions, and testing documentation. Tests cover authentication, blog posts, contact forms, database operations, and complete user workflows.
- July 23, 2025. Enhanced admin dashboard with comprehensive user management and analytics features. Fixed network accessibility by ensuring server binds to 0.0.0.0:5000 for external network connections.
- July 23, 2025. Fixed TypeScript/Zod schema compatibility issues in test pipeline. Resolved type errors by using Drizzle's native $inferInsert/$inferSelect types instead of z.infer with createInsertSchema. Cleaned up deprecated migration files and fixed database utility array destructuring issues.

## User Preferences

Preferred communication style: Simple, everyday language.
