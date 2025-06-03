# 4SaleBackendSkeleton

A production-ready Go backend project skeleton built with hexagonal/clean architecture principles.

## 🏗️ Project Structure

```
backend/
├── cmd/                 # Application entrypoints
│   └── main.go         # Main application entry point
├── internal/           # Private application code
│   └── config/         # Configuration management
├── pkg/                # Public packages (reusable libraries)
├── configs/            # Configuration files and templates
├── api/                # API definitions (OpenAPI/Swagger specs)
├── scripts/            # Build and utility scripts
├── docs/               # Documentation
├── test/               # External test data and utilities
├── migrations/         # Database migration files
├── go.mod              # Go module definition
├── go.sum              # Go module checksums
├── .env.example        # Environment variables template
└── README.md           # This file
```

## 🗃️ Database Setup

### PostgreSQL Database
The project uses PostgreSQL as the database. A database instance has been created and configured with the following environment variables:

- `DATABASE_URL` - Full database connection string
- `PGHOST` - Database host
- `PGPORT` - Database port
- `PGUSER` - Database username
- `PGPASSWORD` - Database password
- `PGDATABASE` - Database name

### Configuration
Database configuration is managed through environment variables. Copy `.env.example` to `.env` and configure your database settings:

```bash
cp .env.example .env
```

The database configuration is loaded automatically from environment variables using the config package.

### Migrations
Database migration files will be stored in the `migrations/` directory. This directory is ready for future schema changes and migrations.

## 🚀 How to Run

### Option 1: Using Replit's Run Button
Simply click the "Run" button in Replit. This will automatically:
- Initialize the Go module
- Tidy dependencies
- Start the server on port 5000

### Option 2: Manual Execution
```bash
cd backend
go mod tidy
go run cmd/main.go
```

## 📡 Available Endpoints

- `GET /health` - Health check endpoint

## 🔧 Configuration

The application uses a configuration system that loads settings from environment variables:

- Database connection settings
- Server host and port configuration
- Environment mode (development/production)

Configuration is managed through the `internal/config` package which provides type-safe access to all configuration values.