#!/usr/bin/env node

/**
 * Backend Connection Setup Script
 * This script helps configure the frontend to connect to the backend
 */

const fs = require('fs');
const path = require('path');

const BACKEND_PATH = 'c:\\b2b-marketplace';
const FRONTEND_PATH = process.cwd();

console.log('🚀 Setting up backend connection...');
console.log(`Frontend: ${FRONTEND_PATH}`);
console.log(`Backend: ${BACKEND_PATH}`);

// Check if backend directory exists
if (!fs.existsSync(BACKEND_PATH)) {
  console.error(`❌ Backend directory not found: ${BACKEND_PATH}`);
  console.log('Please ensure the backend is located at the correct path.');
  process.exit(1);
}

console.log('✅ Backend directory found');

// Check if backend is running
const checkBackendHealth = async () => {
  try {
    const response = await fetch('http://localhost:8000/health');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend is running and healthy');
      console.log(`   App: ${data.app_name}`);
      console.log(`   Version: ${data.version}`);
      console.log(`   Environment: ${data.environment}`);
      return true;
    } else {
      console.log(`⚠️  Backend responded with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Backend is not running or not accessible');
    console.log(`   Error: ${error.message}`);
    return false;
  }
};

// Create environment configuration
const createEnvConfig = () => {
  const envContent = `# Backend Configuration
BACKEND_URL=http://localhost:8000
BACKEND_API_VERSION=v1

# Development settings
NODE_ENV=development
EXPO_PUBLIC_API_URL=http://localhost:8000

# Production settings (update these for production)
# BACKEND_URL=https://api.b2b-marketplace.com
# EXPO_PUBLIC_API_URL=https://api.b2b-marketplace.com
`;

  const envPath = path.join(FRONTEND_PATH, '.env.local');
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file');
};

// Update package.json scripts
const updatePackageScripts = () => {
  const packagePath = path.join(FRONTEND_PATH, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Add backend-related scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    'backend:start': 'cd c:\\b2b-marketplace && docker-compose up -d',
    'backend:stop': 'cd c:\\b2b-marketplace && docker-compose down',
    'backend:logs': 'cd c:\\b2b-marketplace && docker-compose logs -f api',
    'backend:test': 'node scripts/test-backend-connection.js',
    'dev:full': 'npm run backend:start && npm start',
  };
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated package.json with backend scripts');
};

// Create backend test script
const createBackendTestScript = () => {
  const testScript = `#!/usr/bin/env node

/**
 * Backend Connection Test Script
 */

const API_BASE_URL = 'http://localhost:8000';

const testEndpoint = async (endpoint, method = 'GET', body = null) => {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(\`\${API_BASE_URL}\${endpoint}\`, options);
    const data = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

const runTests = async () => {
  console.log('🧪 Testing backend endpoints...');
  
  const tests = [
    { name: 'Health Check', endpoint: '/health', method: 'GET' },
    { name: 'OTP Request', endpoint: '/otp/request', method: 'POST', body: { phone: '09123456789' } },
    { name: 'API Docs', endpoint: '/api/docs', method: 'GET' },
  ];
  
  for (const test of tests) {
    console.log(\`\\n📋 Testing: \${test.name}\`);
    const result = await testEndpoint(test.endpoint, test.method, test.body);
    
    if (result.success) {
      console.log(\`   ✅ Success (\${result.status})\`);
    } else {
      console.log(\`   ❌ Failed: \${result.error || result.status}\`);
    }
  }
};

runTests().catch(console.error);
`;

  const testScriptPath = path.join(FRONTEND_PATH, 'scripts', 'test-backend-connection.js');
  fs.writeFileSync(testScriptPath, testScript);
  console.log('✅ Created backend test script');
};

// Main setup function
const setup = async () => {
  try {
    // Check backend health
    const isBackendRunning = await checkBackendHealth();
    
    if (!isBackendRunning) {
      console.log('\\n⚠️  Backend is not running. Please start it first:');
      console.log('   cd c:\\b2b-marketplace');
      console.log('   docker-compose up -d');
      console.log('\\nOr run: npm run backend:start');
    }
    
    // Create configuration files
    createEnvConfig();
    updatePackageScripts();
    createBackendTestScript();
    
    console.log('\\n🎉 Backend connection setup complete!');
    console.log('\\nNext steps:');
    console.log('1. Start the backend: npm run backend:start');
    console.log('2. Test the connection: npm run backend:test');
    console.log('3. Start the frontend: npm start');
    console.log('\\nFor development with both running: npm run dev:full');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
};

// Run setup
setup();
