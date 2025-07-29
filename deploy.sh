#!/bin/bash

# Vercel Deployment Script for Form Generator

echo "🚀 Preparing for Vercel deployment..."

# Check if we're in the right directory
if [ ! -f "web/package.json" ]; then
    echo "❌ Error: web/package.json not found. Make sure you're in the project root."
    exit 1
fi

# Test the build locally first
echo "📦 Testing build process..."
cd web

# Install dependencies
echo "📥 Installing dependencies..."
npm install

# Run type check
echo "🔍 Running TypeScript check..."
npm run type-check

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🎉 Ready for Vercel deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Push your code to GitHub/GitLab/Bitbucket"
    echo "2. Go to https://vercel.com"
    echo "3. Create a new project"
    echo "4. Import your repository"
    echo "5. Set Root Directory to 'web'"
    echo "6. Set Build Command to 'npm run build'"
    echo "7. Set Output Directory to 'dist'"
    echo "8. Deploy!"
    echo ""
    echo "💡 Don't forget to set VITE_API_URL environment variable in Vercel if you have a backend API."
else
    echo "❌ Build failed! Please fix the errors before deploying."
    exit 1
fi 