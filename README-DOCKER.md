# 🐳 Form Generator - Docker Deployment

This guide explains how to run the Form Generator application using Docker containers.

## 📋 Prerequisites

- **Docker Desktop** installed and running
- **Docker Compose** v3.8 or higher
- At least **2GB RAM** available for containers
- Ports **80** and **5001** available on your system

## 🚀 Quick Start

### Option 1: Using the Build Script (Recommended)

```bash
# Make the script executable (if not already)
chmod +x docker-build.sh

# Build and start the application
./docker-build.sh
```

### Option 2: Manual Docker Compose

```bash
# Build and start containers
docker-compose up --build -d

# View logs
docker-compose logs -f
```

## 🌐 Accessing the Application

Once the containers are running:

- **Frontend Application**: [http://localhost](http://localhost)
- **Backend API**: [http://localhost:5001](http://localhost:5001)
- **Health Check**: [http://localhost/health](http://localhost/health)

## 📊 Container Management

### View Container Status
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend
```

### Stop Containers
```bash
docker-compose down
```

### Restart Containers
```bash
docker-compose restart
```

### Rebuild and Restart
```bash
docker-compose down
docker-compose up --build -d
```

## 🔧 Configuration

### Environment Variables

The application uses the following environment variables (configured in `docker-compose.yml`):

- `DB_HOST`: MySQL database host
- `DB_PORT`: MySQL database port (3306)
- `DB_NAME`: Database name
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `SERVER_PORT`: Backend server port (5001)
- `ENV`: Environment mode (production)

### Database Connection

The application connects to the external MySQL database:
- **Host**: `staging-jan-4-2023-cluster.cluster-cylpew54lkmg.eu-west-1.rds.amazonaws.com`
- **Port**: `3306`
- **Database**: `sc_dynamic_form_generator`

## 📁 Container Architecture

### Backend Container
- **Base Image**: `golang:1.21-alpine` (build) → `alpine:latest` (runtime)
- **Port**: `5001`
- **Health Check**: `http://localhost:5001/health`
- **Features**:
  - Multi-stage build for minimal image size
  - Non-root user for security
  - MySQL connectivity
  - Auto .env loading

### Frontend Container
- **Base Image**: `node:18-alpine` (build) → `nginx:alpine` (runtime)
- **Port**: `80`
- **Health Check**: `http://localhost:80`
- **Features**:
  - Production-optimized React build
  - Nginx with gzip compression
  - API proxy to backend
  - Security headers
  - React Router support

## 🛠️ Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the ports
lsof -i :80
lsof -i :5001

# Kill processes or change ports in docker-compose.yml
```

#### 2. Build Failures
```bash
# Clean Docker cache and rebuild
docker system prune -a
docker-compose build --no-cache
```

#### 3. Database Connection Issues
```bash
# Check backend logs
docker-compose logs backend

# Verify environment variables
docker-compose exec backend env | grep DB_
```

#### 4. Frontend Not Loading
```bash
# Check nginx logs
docker-compose logs frontend

# Verify build output
docker-compose exec frontend ls -la /usr/share/nginx/html/
```

### Health Checks

Both containers include health checks:

```bash
# Check container health
docker-compose ps

# Manual health check
curl http://localhost/health
curl http://localhost:5001/health
```

## 🔐 Security Features

- **Non-root containers**: Both containers run as non-root users
- **Security headers**: Nginx includes security headers (XSS protection, etc.)
- **Network isolation**: Containers communicate via Docker network
- **Minimal images**: Alpine Linux base for smaller attack surface

## 📈 Performance Optimization

- **Multi-stage builds**: Reduced image sizes
- **Gzip compression**: Enabled for frontend assets
- **Static file caching**: 1-year cache for static assets
- **Health checks**: Automatic container restart on failure

## 🧹 Cleanup

### Remove All Containers and Images
```bash
# Stop and remove containers
docker-compose down --remove-orphans

# Remove unused images
docker image prune -a

# Remove all unused Docker resources
docker system prune -a --volumes
```

## 📝 Development vs Production

This Docker setup is configured for **production deployment**. For development:

1. Use the local development servers instead:
   ```bash
   # Backend
   cd backend && go run cmd/main.go
   
   # Frontend  
   cd web && npm run dev
   ```

2. Or create a `docker-compose.dev.yml` for development with volume mounts.

## 🆘 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify environment variables
3. Ensure database connectivity
4. Check port availability
5. Review health check status

For additional help, check the main [README.md](README.md) file. 