# 🚀 Form Generator Deployment Guide

This guide covers deploying the Form Generator application to various platforms.

## 📋 Prerequisites

- Node.js 18+
- Git repository on GitHub
- MySQL database (can be remote)
- Vercel account (for frontend)
- Backend hosting service (Railway, Render, etc.)

## 🏗️ Architecture Overview

The Form Generator is a full-stack application with two main components:

1. **Frontend**: React + TypeScript + Vite (deployed to Vercel)
2. **Backend**: Go API server (deployed to Railway/Render/VPS)
3. **Database**: MySQL (can be hosted on PlanetScale, AWS RDS, etc.)

## 🌐 Vercel Deployment (Frontend)

### Step 1: Prepare Repository

The repository is already configured with:
- `vercel.json` - Vercel configuration
- `web/package.json` with `vercel-build` script
- Environment variable support

### Step 2: Deploy to Vercel

1. **Install Vercel CLI** (if not installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from project root**:
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project? `N`
   - Project name: `form-generator`
   - Directory: `.` (current directory)
   - Override settings? `Y` if needed

### Step 3: Configure Environment Variables

In Vercel Dashboard (vercel.com):

1. Go to your project → Settings → Environment Variables
2. Add the following variable:
   - `VITE_API_BASE_URL`: Your backend API URL (e.g., `https://your-backend.railway.app`)

### Step 4: Redeploy

After adding environment variables:
```bash
vercel --prod
```

## 🖥️ Backend Deployment Options

### Option 1: Railway

1. **Create Railway Account**: [railway.app](https://railway.app)

2. **Deploy from GitHub**:
   - Connect your GitHub repository
   - Select the `cursor-form` branch
   - Railway will auto-detect the Go application

3. **Configure Environment Variables**:
   ```
   DB_HOST=your-mysql-host
   DB_PORT=3306
   DB_NAME=your-database-name
   DB_USER=your-username
   DB_PASSWORD=your-password
   SERVER_PORT=8080
   ENV=production
   ```

4. **Custom Start Command** (if needed):
   ```
   cd backend && go run cmd/main.go
   ```

### Option 2: Render

1. **Create Render Account**: [render.com](https://render.com)

2. **Create Web Service**:
   - Connect GitHub repository
   - Runtime: `Go`
   - Build Command: `cd backend && go build -o main cmd/main.go`
   - Start Command: `cd backend && ./main`

3. **Add Environment Variables** (same as Railway)

### Option 3: DigitalOcean App Platform

1. **Create DigitalOcean Account**

2. **Create App**:
   - Source: GitHub repository
   - Branch: `cursor-form`
   - Autodeploy: Yes

3. **Configure Service**:
   - Name: `form-generator-backend`
   - Source Directory: `/backend`
   - Build Command: `go build -o main cmd/main.go`
   - Run Command: `./main`

## 🗄️ Database Options

### Option 1: PlanetScale (Recommended for MySQL)

1. **Create PlanetScale Account**: [planetscale.com](https://planetscale.com)
2. **Create Database**: `form-generator`
3. **Create Branch**: `main`
4. **Get Connection String**: Use in environment variables
5. **Run Migration**: Use the `/migrate-hero-image` endpoint after deployment

### Option 2: AWS RDS

1. **Create RDS MySQL Instance**
2. **Configure Security Groups** for access
3. **Create Database**: `form-generator`
4. **Use Connection Details** in environment variables

### Option 3: Digital Ocean Managed Database

1. **Create MySQL Database Cluster**
2. **Configure Firewall Rules**
3. **Use Connection String** in environment variables

## 🔧 Environment Variables Reference

### Frontend (.env.local for development)
```bash
VITE_API_BASE_URL=https://your-backend-url.com
```

### Backend
```bash
DB_HOST=your-mysql-host
DB_PORT=3306
DB_NAME=form-generator
DB_USER=your-username
DB_PASSWORD=your-password
SERVER_PORT=8080
ENV=production
```

## 🚀 Complete Deployment Steps

### 1. Deploy Backend First

1. Choose backend platform (Railway/Render/DigitalOcean)
2. Connect your GitHub repository
3. Set environment variables
4. Deploy and get the backend URL

### 2. Deploy Frontend

1. Update `VITE_API_BASE_URL` in Vercel
2. Deploy frontend to Vercel
3. Test the connection

### 3. Database Setup

1. Create tables using your preferred method:
   - Use the existing schema from your local database
   - Or let the application create tables automatically
2. Run the migration endpoint: `POST /migrate-hero-image`

### 4. Test the Deployment

1. **Frontend**: Visit your Vercel URL
2. **Backend Health**: Check `your-backend-url.com/health`
3. **API Connection**: Test form creation/retrieval
4. **Database**: Verify data persistence

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Backend includes CORS headers
   - Verify API_BASE_URL is correct

2. **Database Connection Failed**:
   - Check environment variables
   - Verify database host accessibility
   - Ensure credentials are correct

3. **Build Failures**:
   - Check Node.js version (use 18+)
   - Verify all dependencies are listed in package.json
   - Check for TypeScript errors

4. **API Not Found**:
   - Verify backend URL is accessible
   - Check API routes are working
   - Confirm environment variables are set

### Debug Commands

```bash
# Test backend health
curl https://your-backend-url.com/health

# Test API endpoint
curl https://your-backend-url.com/api/forms

# Check frontend environment
console.log(import.meta.env.VITE_API_BASE_URL)
```

## 📊 Production Monitoring

### Recommended Tools

1. **Vercel Analytics**: Built-in frontend monitoring
2. **Railway Metrics**: Backend performance monitoring
3. **Database Monitoring**: Use your database provider's tools
4. **Uptime Monitoring**: UptimeRobot, Pingdom, etc.

## 🔐 Security Considerations

1. **Environment Variables**: Never commit secrets to git
2. **Database Access**: Use secure connection strings
3. **CORS**: Configure properly for production domains
4. **HTTPS**: Ensure all connections use SSL/TLS
5. **Database Security**: Use strong passwords and firewall rules

## 🔄 CI/CD Setup

### Automatic Deployments

1. **Vercel**: Auto-deploys on git push to main branch
2. **Railway**: Auto-deploys on git push
3. **GitHub Actions**: Can be configured for more complex workflows

### Example GitHub Action (Optional)

```yaml
name: Deploy
on:
  push:
    branches: [main, cursor-form]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📈 Scaling Considerations

1. **Database**: Use connection pooling for high traffic
2. **Backend**: Configure horizontal scaling
3. **Frontend**: Vercel handles this automatically
4. **CDN**: Use for static assets (images, fonts)
5. **Caching**: Implement Redis for session/data caching

Your Form Generator is now ready for production deployment! 🎉 