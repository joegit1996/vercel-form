# Dynamic Form Creator

A production-ready full-stack application for creating and managing dynamic forms with comprehensive response handling.

## 🚀 Features

- **Dynamic Form Builder**: Create forms with various field types (text, textarea, select, radio, checkbox, etc.)
- **Hero Image Support**: Upload and display hero banners with drag-and-drop functionality
- **Response Management**: Dedicated pages for viewing form responses with CSV export
- **MySQL Integration**: Production-ready database with AWS RDS support
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **4Sale Branding**: Integrated design system with custom fonts
- **Multilingual Support**: Arabic/English with RTL/LTR support
- **Responsive Design**: Mobile-first approach with modern components

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **i18next** for internationalization

### Backend
- **Go** with hexagonal architecture
- **MySQL** (AWS RDS) with Drizzle ORM
- **RESTful API** with CORS support
- **File uploads** for hero images

## 🏗 Architecture

```
├── backend/              # Go backend (hexagonal architecture)
├── web/                  # React frontend
│   ├── src/
│   │   ├── app/         # Application layer
│   │   ├── pages/       # UI pages
│   │   ├── presentation/ # UI components
│   │   ├── application/ # Business logic
│   │   └── infrastructure/ # API clients
├── shared/              # Shared schemas and types
├── main.go             # Go entry point
└── package.json        # Node.js dependencies
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- Go 1.19+
- MySQL 8.0+

### Environment Setup
Create a `.env` file with your database credentials:
```bash
DB_HOST=your-mysql-host
DB_PORT=3306
DB_NAME=your-database
DB_USER=your-username
DB_PASSWORD=your-password
```

### Installation
```bash
# Install dependencies
npm install

# Push database schema
npx drizzle-kit push

# Start Go backend (port 5000)
go run main.go

# Start React frontend (port 3000)
cd web && npm run dev
```

## 📊 Database Schema

### Forms Table
- Form definitions with fields, hero images, and settings
- JSON storage for dynamic field configurations
- Soft delete support

### Form Responses Table
- User submissions with phone numbers (required)
- JSON storage for response data
- Timestamp tracking

## 🎨 Features Overview

### Form Builder
- Drag-and-drop interface
- Multiple field types with validation
- Hero image upload (max 5MB)
- Custom submit button text
- Preview functionality

### Response Management
- Dedicated response viewing pages
- CSV export functionality
- Pagination support
- Professional data display

### File Management
- Secure file upload with validation
- Image optimization and storage
- Hero banner integration

## 🌐 API Endpoints

```
POST   /api/forms              - Create new form
GET    /api/forms              - Get all forms (paginated)
GET    /api/forms/{id}         - Get specific form
PUT    /api/forms/{id}         - Update existing form
DELETE /api/forms/{id}         - Soft delete form
POST   /api/submit             - Submit form response
GET    /api/forms/{id}/responses - Get form responses
POST   /api/upload             - Upload hero image
```

## 🔧 Development

The project uses:
- **TDD methodology** for robust development
- **Clean architecture** with clear separation of concerns
- **Type safety** throughout with TypeScript
- **Modern tooling** with Vite and hot reload

## 📝 Recent Updates

- ✅ Database migration from PostgreSQL to MySQL
- ✅ Enhanced response viewing with dedicated pages
- ✅ CSV export functionality
- ✅ Hero image upload with validation
- ✅ Comprehensive form builder interface

## 🚀 Deployment

The application is ready for deployment with:
- Environment-based configuration
- Production-optimized builds
- Database migration support
- Scalable architecture

## 📄 License

This project is configured for production use with the 4Sale design system and branding.