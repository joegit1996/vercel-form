# 4Sale Backend Skeleton - Production Ready Go Project

## Overview

This is a production-ready full-stack application featuring a Go backend with hexagonal architecture and a modern React frontend built with the 4Sale Design System. The project emphasizes multilingual support (Arabic/English), custom font integration (SakrPro), and comprehensive localization with RTL/LTR support.

## System Architecture

### Overall Structure
The project follows a monorepo structure with clear separation between backend and frontend:
- **Backend**: Go application using hexagonal/clean architecture
- **Frontend**: React TypeScript application using onion architecture principles
- **Database**: PostgreSQL with Drizzle ORM for data persistence
- **Build System**: Vite for frontend, Go native tooling for backend

### Key Design Decisions
1. **Hexagonal Architecture (Backend)**: Chosen for maintainability, testability, and separation of concerns
2. **Onion Architecture (Frontend)**: Ensures proper layering with domain logic at the center
3. **Monorepo Structure**: Enables shared configurations and coordinated development
4. **TypeScript**: Provides type safety and better developer experience
5. **Custom Font (SakrPro)**: Ensures consistent branding with no fallback fonts

## Key Components

### Backend Components (`/backend`)
- **Application Layer**: Entry points and configuration (`cmd/`, `internal/config/`)
- **Domain Layer**: Business logic and entities (to be implemented)
- **Infrastructure Layer**: Database, external services (PostgreSQL setup ready)
- **API Layer**: REST endpoints and OpenAPI specifications (`api/`)
- **Database**: MySQL (AWS RDS) with environment-based configuration

### Frontend Components (`/web`)
- **App Layer** (`src/app/`): Application configuration, providers, and routing
- **Presentation Layer** (`src/presentation/`): UI components, pages, and design system integration
- **Application Layer** (`src/application/`): Business logic, hooks, utilities, and i18n infrastructure
- **Domain Layer** (`src/domain/`): Business models, types, and design tokens
- **Infrastructure Layer** (`src/infrastructure/`): API clients and external service integrations

### Design System Integration
- Built on 4Sale Design System (`@4saletech/web-design-system`)
- Comprehensive component library with variants, sizes, and accessibility features
- Tailwind CSS integration with custom design tokens
- Storybook documentation for component showcase

## Data Flow

### Authentication Flow
- Backend handles authentication with JWT tokens
- Frontend stores tokens securely and manages session state
- Protected routes and API calls include authentication headers

### Localization Flow
1. User selects language via LanguageSwitcher component
2. i18next loads appropriate translation files from `/public/locales/`
3. HTML attributes (dir, lang) update automatically
4. CSS classes apply RTL/LTR specific styling
5. All components re-render with new language and direction

### Data Persistence Flow
1. Frontend makes API calls to Go backend
2. Backend validates and processes requests
3. Data is persisted to PostgreSQL via Drizzle ORM
4. Responses are returned to frontend for UI updates

## External Dependencies

### Backend Dependencies
- **Go Modules**: Dependency management
- **MySQL**: Primary database (AWS RDS)
- **Environment Variables**: Configuration management via `.env`

### Frontend Dependencies
- **React 18**: Core framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling framework
- **i18next**: Internationalization
- **Lucide React**: Icon library
- **Storybook**: Component documentation
- **Vitest**: Testing framework

### Font Assets
- **SakrPro Font Family**: Custom web fonts (Light, Regular, Medium, Bold)
- Located in `/web/public/fonts/`
- Supports both Arabic (RTL) and English (LTR) text rendering

## Deployment Strategy

### Development Environment
- Backend runs on port 5000 (`go run main.go`)
- Frontend runs on port 3000 (`npm run dev`)
- Hot reload enabled for both backend and frontend
- Database connection via environment variables

### Production Considerations
- Backend compiled to single binary
- Frontend built as static assets
- Environment-specific configuration
- Database migrations ready in `/backend/migrations/`
- Security best practices enforced (no hardcoded secrets)

### Testing Strategy
- **TDD Methodology**: Test-driven development as default approach
- Backend: Go testing framework with testify
- Frontend: Vitest with React Testing Library
- Component testing via Storybook
- Integration tests for API endpoints

## Changelog

- July 20, 2025: Database migration from PostgreSQL to MySQL
  - Updated schema from pgTable to mysqlTable syntax
  - Changed database connection from Neon to AWS RDS MySQL
  - Updated Drizzle configuration for MySQL dialect
  - Added SSL configuration for secure connections
  - Note: Connection requires IP whitelisting (Replit IP: 34.168.173.153)
- June 30, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.