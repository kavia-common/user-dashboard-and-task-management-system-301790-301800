#!/usr/bin/env node

/**
 * End-to-End Verification Script
 * Tests all API endpoints and validates the integration
 */

const axios = require('axios');

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const TEST_EMAIL = `test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'testpass123';
const TEST_NAME = 'Test User';

let authToken = null;
let userId = null;
let taskId = null;

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name) {
  console.log(`\n${colors.blue}Testing: ${name}${colors.reset}`);
}

function logSuccess(message) {
  log(`  ✅ ${message}`, 'green');
}

function logError(message) {
  log(`  ❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`  ⚠️  ${message}`, 'yellow');
}

async function testHealthEndpoint() {
  logTest('Health Endpoint');
  try {
    const response = await axios.get(`${BASE_URL}/`);
    
    if (response.status === 200) {
      logSuccess('Health endpoint responding');
      logSuccess(`Status: ${response.data.status}`);
      return true;
    }
  } catch (error) {
    logError(`Health endpoint failed: ${error.message}`);
    return false;
  }
}

async function testCORS() {
  logTest('CORS Configuration');
  try {
    const response = await axios.options(`${BASE_URL}/auth/login`, {
      headers: {
        'Origin': process.env.CORS_ORIGIN || 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    });
    
    const allowOrigin = response.headers['access-control-allow-origin'];
    const allowMethods = response.headers['access-control-allow-methods'];
    const allowHeaders = response.headers['access-control-allow-headers'];
    
    if (allowOrigin) {
      logSuccess(`Access-Control-Allow-Origin: ${allowOrigin}`);
    } else {
      logWarning('CORS Allow-Origin header not set');
    }
    
    if (allowMethods && allowMethods.includes('POST')) {
      logSuccess('Access-Control-Allow-Methods includes POST');
    }
    
    if (allowHeaders && allowHeaders.toLowerCase().includes('authorization')) {
      logSuccess('Authorization header allowed in CORS');
    } else {
      logWarning('Authorization header may not be allowed in CORS');
    }
    
    return true;
  } catch (error) {
    logError(`CORS test failed: ${error.message}`);
    return false;
  }
}

async function testSignup() {
  logTest('User Signup');
  try {
    const response = await axios.post(`${BASE_URL}/auth/signup`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      name: TEST_NAME
    });
    
    if (response.status === 201 && response.data.success) {
      authToken = response.data.data.token;
      userId = response.data.data.user._id;
      logSuccess('User signup successful');
      logSuccess(`Token received: ${authToken.substring(0, 20)}...`);
      logSuccess(`User ID: ${userId}`);
      return true;
    }
  } catch (error) {
    if (error.response?.status === 400 && error.response.data.message.includes('already exists')) {
      logWarning('User already exists, trying login instead');
      return await testLogin();
    }
    logError(`Signup failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testLogin() {
  logTest('User Login');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (response.status === 200 && response.data.success) {
      authToken = response.data.data.token;
      userId = response.data.data.user._id;
      logSuccess('Login successful');
      logSuccess(`Token received: ${authToken.substring(0, 20)}...`);
      return true;
    }
  } catch (error) {
    logError(`Login failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testAuthMiddleware() {
  logTest('JWT Authentication Middleware');
  
  // Test with no token
  try {
    await axios.get(`${BASE_URL}/profile`);
    logError('Protected route accessible without token');
  } catch (error) {
    if (error.response?.status === 401) {
      logSuccess('Protected route correctly rejects requests without token');
    }
  }
  
  // Test with invalid token
  try {
    await axios.get(`${BASE_URL}/profile`, {
      headers: { Authorization: 'Bearer invalid_token' }
    });
    logError('Protected route accepts invalid token');
  } catch (error) {
    if (error.response?.status === 401) {
      logSuccess('Protected route correctly rejects invalid token');
    }
  }
  
  return true;
}

async function testGetProfile() {
  logTest('Get Profile');
  try {
    const response = await axios.get(`${BASE_URL}/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200 && response.data.success) {
      logSuccess('Profile retrieved successfully');
      logSuccess(`Name: ${response.data.data.name}`);
      logSuccess(`Email: ${response.data.data.email}`);
      return true;
    }
  } catch (error) {
    logError(`Get profile failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testUpdateProfile() {
  logTest('Update Profile');
  try {
    const response = await axios.put(`${BASE_URL}/profile`, {
      name: 'Updated Test User',
      bio: 'This is a test bio'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200 && response.data.success) {
      logSuccess('Profile updated successfully');
      logSuccess(`Updated name: ${response.data.data.name}`);
      return true;
    }
  } catch (error) {
    logError(`Update profile failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testCreateTask() {
  logTest('Create Task');
  try {
    const response = await axios.post(`${BASE_URL}/tasks`, {
      title: 'Test Task',
      description: 'This is a test task',
      status: 'pending',
      priority: 'medium',
      dueDate: new Date(Date.now() + 86400000).toISOString()
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 201 && response.data.success) {
      taskId = response.data.data._id;
      logSuccess('Task created successfully');
      logSuccess(`Task ID: ${taskId}`);
      return true;
    }
  } catch (error) {
    logError(`Create task failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testGetTasks() {
  logTest('Get Tasks (List)');
  try {
    const response = await axios.get(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200 && response.data.success) {
      logSuccess(`Tasks retrieved: ${response.data.count} tasks`);
      return true;
    }
  } catch (error) {
    logError(`Get tasks failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testSearchTasks() {
  logTest('Search Tasks (by query)');
  try {
    const response = await axios.get(`${BASE_URL}/tasks?search=Test`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200 && response.data.success) {
      logSuccess(`Search returned ${response.data.count} tasks`);
      return true;
    }
  } catch (error) {
    logError(`Search tasks failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testFilterTasks() {
  logTest('Filter Tasks (by status)');
  try {
    const response = await axios.get(`${BASE_URL}/tasks?status=pending`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200 && response.data.success) {
      logSuccess(`Filter returned ${response.data.count} pending tasks`);
      return true;
    }
  } catch (error) {
    logError(`Filter tasks failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testUpdateTask() {
  logTest('Update Task');
  try {
    const response = await axios.put(`${BASE_URL}/tasks/${taskId}`, {
      status: 'completed',
      title: 'Updated Test Task'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200 && response.data.success) {
      logSuccess('Task updated successfully');
      return true;
    }
  } catch (error) {
    logError(`Update task failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testDeleteTask() {
  logTest('Delete Task');
  try {
    const response = await axios.delete(`${BASE_URL}/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200 && response.data.success) {
      logSuccess('Task deleted successfully');
      return true;
    }
  } catch (error) {
    logError(`Delete task failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testSwaggerDocs() {
  logTest('Swagger API Documentation');
  try {
    const response = await axios.get(`${BASE_URL}/docs/`);
    
    if (response.status === 200) {
      logSuccess('Swagger UI accessible');
    }
    
    // Check if OpenAPI spec is available
    const specResponse = await axios.get(`${BASE_URL}/interfaces/openapi.json`).catch(() => null);
    if (specResponse) {
      logSuccess('OpenAPI specification available');
      const spec = specResponse.data;
      
      if (spec.paths['/auth/signup'] && spec.paths['/auth/login']) {
        logSuccess('Auth endpoints documented');
      }
      if (spec.paths['/profile']) {
        logSuccess('Profile endpoints documented');
      }
      if (spec.paths['/tasks']) {
        logSuccess('Tasks endpoints documented');
      }
    }
    
    return true;
  } catch (error) {
    logError(`Swagger docs check failed: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  log('END-TO-END VERIFICATION SCRIPT', 'blue');
  log(`Backend URL: ${BASE_URL}`, 'blue');
  console.log('='.repeat(60));
  
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0
  };
  
  // Run all tests in sequence
  const tests = [
    testHealthEndpoint,
    testCORS,
    testSignup,
    testAuthMiddleware,
    testGetProfile,
    testUpdateProfile,
    testCreateTask,
    testGetTasks,
    testSearchTasks,
    testFilterTasks,
    testUpdateTask,
    testDeleteTask,
    testSwaggerDocs
  ];
  
  for (const test of tests) {
    const result = await test();
    if (result) results.passed++;
    else results.failed++;
  }
  
  console.log('\n' + '='.repeat(60));
  log('VERIFICATION SUMMARY', 'blue');
  console.log('='.repeat(60));
  logSuccess(`Passed: ${results.passed}`);
  if (results.failed > 0) {
    logError(`Failed: ${results.failed}`);
  }
  console.log('='.repeat(60) + '\n');
  
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run the tests
runAllTests().catch(err => {
  logError(`Verification script error: ${err.message}`);
  process.exit(1);
});
