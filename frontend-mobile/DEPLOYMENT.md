# Deployment Guide - B2B Marketplace

This guide covers deploying the B2B Marketplace application to all platforms: Android, iOS, and Web.

## 📱 Mobile Apps (Android & iOS)

### Prerequisites

1. **EAS CLI**: Install the Expo Application Services CLI
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **EAS Account**: Create an account at [expo.dev](https://expo.dev)

3. **App Store Accounts**:
   - **Google Play Console** account for Android
   - **Apple Developer** account for iOS

### Configuration

1. **Update EAS Configuration** (`eas.json`):
   ```json
   {
     "submit": {
       "production": {
         "ios": {
           "appleId": "your-apple-id@example.com",
           "ascAppId": "your-app-store-connect-app-id",
           "appleTeamId": "your-apple-team-id"
         },
         "android": {
           "serviceAccountKeyPath": "./google-service-account.json",
           "track": "production"
         }
       }
     }
   }
   ```

2. **Update App Configuration** (`app.json`):
   ```json
   {
     "expo": {
       "extra": {
         "eas": {
           "projectId": "your-actual-project-id"
         }
       }
     }
   }
   ```

### Building Mobile Apps

#### Quick Build
```bash
# Build both platforms
npm run deploy:mobile

# Or build individually
npm run build:android
npm run build:ios
```

#### Manual Build Process

1. **Login to EAS**:
   ```bash
   eas login
   ```

2. **Build for Android**:
   ```bash
   eas build --platform android --profile production
   ```

3. **Build for iOS**:
   ```bash
   eas build --platform ios --profile production
   ```

4. **Submit to App Stores**:
   ```bash
   # Submit to Google Play Store
   eas submit --platform android --profile production
   
   # Submit to Apple App Store
   eas submit --platform ios --profile production
   ```

### App Store Requirements

#### Android (Google Play Store)
- **Package Name**: `com.b2bmarketplace.app`
- **Version Code**: Increment for each release
- **Signing**: EAS handles automatic signing
- **Requirements**: 
  - Privacy Policy
  - App Content Rating
  - Store Listing Assets

#### iOS (Apple App Store)
- **Bundle Identifier**: `com.b2bmarketplace.app`
- **Build Number**: Increment for each release
- **Signing**: EAS handles automatic signing
- **Requirements**:
  - App Store Connect setup
  - Privacy Policy
  - App Review Guidelines compliance

## 🌐 Web Application

### Prerequisites

1. **Web Hosting**: Choose a hosting provider:
   - Vercel (recommended)
   - Netlify
   - GitHub Pages
   - Custom server

2. **Domain**: Configure your domain name

### Building Web App

#### Quick Deploy
```bash
npm run deploy:web
```

#### Manual Build Process

1. **Build the Web App**:
   ```bash
   npm run build:web
   ```

2. **Deploy to Hosting**:
   ```bash
   # For Vercel
   npx vercel --prod
   
   # For Netlify
   npx netlify deploy --prod --dir=dist
   
   # For GitHub Pages
   npx gh-pages -d dist
   ```

### Web App Features

#### PWA (Progressive Web App)
- **Offline Support**: Service worker caches content
- **Install Prompt**: Users can install as native app
- **Push Notifications**: Background notifications
- **Responsive Design**: Works on all screen sizes

#### SEO Optimization
- **Meta Tags**: Proper meta descriptions and titles
- **Sitemap**: `sitemap.xml` for search engines
- **Robots.txt**: Search engine crawling rules
- **Structured Data**: Rich snippets for search results

### Web Hosting Configuration

#### Vercel (Recommended)
1. Connect your GitHub repository
2. Configure build settings:
   - **Build Command**: `npm run build:web`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### Netlify
1. Connect your repository
2. Configure build settings:
   - **Build Command**: `npm run build:web`
   - **Publish Directory**: `dist`
   - **Node Version**: 18.x

#### Custom Server
1. Upload `dist` folder to your server
2. Configure web server (Nginx/Apache):
   ```nginx
   # Nginx configuration
   server {
       listen 80;
       server_name your-domain.com;
       root /path/to/dist;
       index index.html;
       
       # Handle SPA routing
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # Cache static assets
       location /static/ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

## 🔧 Environment Configuration

### Development
```env
NODE_ENV=development
EXPO_PUBLIC_API_URL=http://localhost:8000
```

### Staging
```env
NODE_ENV=staging
EXPO_PUBLIC_API_URL=https://staging-api.b2b-marketplace.com
```

### Production
```env
NODE_ENV=production
EXPO_PUBLIC_API_URL=https://api.b2b-marketplace.com
```

## 📊 Monitoring & Analytics

### App Store Analytics
- **Google Play Console**: Download and install metrics
- **App Store Connect**: Sales and usage analytics
- **Firebase Analytics**: User behavior tracking

### Web Analytics
- **Google Analytics**: Website traffic and user behavior
- **Vercel Analytics**: Performance and usage metrics
- **Custom Analytics**: Business-specific metrics

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Update version numbers
- [ ] Test on all platforms
- [ ] Update changelog
- [ ] Review app store requirements
- [ ] Prepare release notes

### Mobile Apps
- [ ] Build successful on EAS
- [ ] Test on physical devices
- [ ] Submit to app stores
- [ ] Monitor review process
- [ ] Handle app store feedback

### Web App
- [ ] Build successful
- [ ] Test PWA functionality
- [ ] Verify SEO optimization
- [ ] Test on different browsers
- [ ] Monitor performance

### Post-Deployment
- [ ] Monitor crash reports
- [ ] Track user feedback
- [ ] Monitor performance metrics
- [ ] Update documentation
- [ ] Plan next release

## 🔄 Continuous Deployment

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build:web
      - run: npm run deploy:web
```

## 🆘 Troubleshooting

### Common Issues

#### Build Failures
- Check EAS project configuration
- Verify app.json settings
- Review build logs in EAS dashboard

#### App Store Rejections
- Review app store guidelines
- Address feedback from reviewers
- Test on different devices

#### Web Deployment Issues
- Check build output
- Verify hosting configuration
- Test PWA functionality

### Support Resources
- [EAS Documentation](https://docs.expo.dev/eas/)
- [Expo Deployment Guide](https://docs.expo.dev/distribution/introduction/)
- [PWA Documentation](https://web.dev/progressive-web-apps/)

---

**Ready to deploy?** Run `npm run deploy:all` to deploy to all platforms!
