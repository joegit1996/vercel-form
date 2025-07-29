# Vercel Deployment Guide

This guide will help you deploy your Form Generator application to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, or Bitbucket)
3. **Node.js**: Ensure you have Node.js 18+ installed locally for testing

## Deployment Steps

### 1. Prepare Your Repository

Make sure your repository is pushed to GitHub, GitLab, or Bitbucket.

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository
4. Configure the project settings:

### 3. Project Configuration

**Framework Preset**: Vite
**Root Directory**: `web`
**Build Command**: `npm run build`
**Output Directory**: `dist`
**Install Command**: `npm install`

### 4. Environment Variables

If your application uses environment variables, add them in the Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add any required variables (e.g., API endpoints)

### 5. Deploy

Click "Deploy" and Vercel will:
1. Install dependencies
2. Build your application
3. Deploy to a production URL

## Configuration Files

The following configuration files have been created for Vercel deployment:

### `vercel.json` (Root)
```json
{
  "buildCommand": "cd web && npm install && npm run build",
  "outputDirectory": "web/dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### `web/vercel.json`
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## Important Notes

### API Configuration
Your application currently uses a proxy configuration for API calls (`/api`). For production:

1. **Option 1**: Deploy your backend separately and update the API base URL
2. **Option 2**: Use Vercel serverless functions for API endpoints
3. **Option 3**: Use external API services

### Environment Variables
Update the API base URL in production by setting environment variables:

```typescript
// In web/src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
```

### Custom Domain
After deployment, you can add a custom domain in the Vercel dashboard.

## Troubleshooting

### Build Issues
- Ensure all dependencies are in `package.json`
- Check that the build command works locally: `cd web && npm run build`
- Verify TypeScript compilation passes

### Routing Issues
- The `vercel.json` configuration handles client-side routing
- All routes redirect to `index.html` for React Router

### Performance
- Assets are cached for 1 year
- Code splitting is configured for better performance
- Consider enabling Vercel Analytics for monitoring

## Post-Deployment

1. **Test**: Verify all routes work correctly
2. **Monitor**: Check Vercel Analytics and logs
3. **Optimize**: Review performance metrics
4. **Update**: Set up automatic deployments from your main branch

## Backend Deployment

If you need to deploy the backend separately:

1. **Railway**: Good for Go applications
2. **Heroku**: Supports Go with buildpacks
3. **DigitalOcean App Platform**: Simple deployment
4. **AWS/GCP**: More complex but scalable

Update the frontend API configuration to point to your deployed backend URL. 