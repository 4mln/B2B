#!/bin/bash

# Web Deployment Script for B2B Marketplace
echo "🚀 Deploying B2B Marketplace Web App..."

# Build the web app
echo "📦 Building web application..."
npm run build:web

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Web app built successfully!"

# Deploy to your hosting service
# Uncomment and configure for your hosting provider:

# For Vercel:
# echo "🌐 Deploying to Vercel..."
# npx vercel --prod

# For Netlify:
# echo "🌐 Deploying to Netlify..."
# npx netlify deploy --prod --dir=dist

# For GitHub Pages:
# echo "🌐 Deploying to GitHub Pages..."
# npm install -g gh-pages
# gh-pages -d dist

# For custom server:
echo "📁 Build files are ready in the 'dist' directory"
echo "📋 Next steps:"
echo "   1. Upload the 'dist' folder to your web server"
echo "   2. Configure your server to serve the index.html file"
echo "   3. Set up HTTPS for PWA functionality"
echo "   4. Configure your domain to point to the server"

echo "🎉 Web deployment preparation complete!"
