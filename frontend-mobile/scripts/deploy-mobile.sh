#!/bin/bash

# Mobile App Deployment Script for B2B Marketplace
echo "📱 Deploying B2B Marketplace Mobile Apps..."

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "📦 Installing EAS CLI..."
    npm install -g @expo/eas-cli
fi

# Login to EAS (if not already logged in)
echo "🔐 Checking EAS authentication..."
eas whoami > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Please login to EAS:"
    eas login
fi

# Build for Android
echo "🤖 Building Android app..."
eas build --platform android --profile production

if [ $? -ne 0 ]; then
    echo "❌ Android build failed!"
    exit 1
fi

echo "✅ Android app built successfully!"

# Build for iOS
echo "🍎 Building iOS app..."
eas build --platform ios --profile production

if [ $? -ne 0 ]; then
    echo "❌ iOS build failed!"
    exit 1
fi

echo "✅ iOS app built successfully!"

# Submit to app stores (optional)
read -p "Do you want to submit to app stores? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📤 Submitting to app stores..."
    
    # Submit to Google Play Store
    echo "📤 Submitting to Google Play Store..."
    eas submit --platform android --profile production
    
    # Submit to Apple App Store
    echo "📤 Submitting to Apple App Store..."
    eas submit --platform ios --profile production
    
    echo "✅ Apps submitted to app stores!"
fi

echo "🎉 Mobile deployment complete!"
echo "📋 Next steps:"
echo "   1. Check build status in EAS dashboard"
echo "   2. Download and test the apps"
echo "   3. Submit for review (if not done automatically)"
echo "   4. Monitor app store review process"
