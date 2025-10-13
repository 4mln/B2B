#!/usr/bin/env node

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
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
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
    console.log(`\n📋 Testing: ${test.name}`);
    const result = await testEndpoint(test.endpoint, test.method, test.body);
    
    if (result.success) {
      console.log(`   ✅ Success (${result.status})`);
    } else {
      console.log(`   ❌ Failed: ${result.error || result.status}`);
    }
  }
};

runTests().catch(console.error);
