#!/usr/bin/env node

/**
 * Integration Test Script
 * Tests that all backend endpoints are working correctly
 */

const API_URL = 'http://localhost:3001';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, url, options = {}) {
  try {
    const response = await fetch(`${API_URL}${url}`, options);
    const data = await response.json();
    
    if (response.ok) {
      log(`✅ ${name}`, 'green');
      return { success: true, data };
    } else {
      log(`❌ ${name} - ${data.error || 'Failed'}`, 'red');
      return { success: false, error: data.error };
    }
  } catch (error) {
    log(`❌ ${name} - ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('\n🧪 Starting Integration Tests\n', 'blue');
  
  let token = null;
  const results = {
    passed: 0,
    failed: 0
  };

  // Test 1: Health Check
  log('Testing Basic Connectivity...', 'yellow');
  const health = await testEndpoint('Health Check', '/health');
  health.success ? results.passed++ : results.failed++;

  // Test 2: Solana Config
  log('\nTesting Solana Integration...', 'yellow');
  const solanaConfig = await testEndpoint('Solana Config', '/api/solana/config');
  solanaConfig.success ? results.passed++ : results.failed++;
  
  if (solanaConfig.success) {
    log(`   Mode: ${solanaConfig.data.mode}`, 'blue');
    log(`   Network: ${solanaConfig.data.network}`, 'blue');
  }

  // Test 3: Get Pools (Public)
  log('\nTesting Public Endpoints...', 'yellow');
  const pools = await testEndpoint('Get Pools', '/api/pools');
  pools.success ? results.passed++ : results.failed++;
  
  if (pools.success) {
    log(`   Found ${pools.data.length} pools`, 'blue');
  }

  // Test 4: Register User
  log('\nTesting Authentication...', 'yellow');
  const testEmail = `test${Date.now()}@example.com`;
  const register = await testEndpoint('Register User', '/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'test123456',
      role: 'funder'
    })
  });
  register.success ? results.passed++ : results.failed++;
  
  if (register.success) {
    token = register.data.token;
    log(`   User created: ${testEmail}`, 'blue');
  }

  // Test 5: Login
  const login = await testEndpoint('Login User', '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'test123456'
    })
  });
  login.success ? results.passed++ : results.failed++;
  
  if (login.success) {
    token = login.data.token;
    log(`   Login successful`, 'blue');
  }

  if (!token) {
    log('\n⚠️  No auth token - skipping protected endpoint tests', 'yellow');
  } else {
    // Test 6: Get Current User
    const me = await testEndpoint('Get Current User', '/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    me.success ? results.passed++ : results.failed++;

    // Test 7: Get Positions
    log('\nTesting Protected Endpoints...', 'yellow');
    const positions = await testEndpoint('Get Positions', '/api/positions', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    positions.success ? results.passed++ : results.failed++;

    // Test 8: Pool Allocation (SIM mode)
    log('\nTesting Solana Transactions (SIM Mode)...', 'yellow');
    const allocation = await testEndpoint('Pool Allocation', '/api/solana/pool-allocate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        tenorDays: 90,
        amount: 1000,
        walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        network: 'devnet',
        idempotencyKey: `test-${Date.now()}`
      })
    });
    allocation.success ? results.passed++ : results.failed++;
    
    if (allocation.success) {
      log(`   TX Signature: ${allocation.data.txSignature}`, 'blue');
      log(`   Position ID: ${allocation.data.positionId}`, 'blue');
      log(`   Expected Yield: €${allocation.data.expectedYield}`, 'blue');
    }

    // Test 9: Get Pool Accounts
    const poolAccounts = await testEndpoint('Get Pool Accounts', '/api/solana/pool-accounts', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    poolAccounts.success ? results.passed++ : results.failed++;
  }

  // Summary
  log('\n' + '='.repeat(50), 'blue');
  log(`\n📊 Test Results:`, 'blue');
  log(`   ✅ Passed: ${results.passed}`, 'green');
  log(`   ❌ Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`   Total: ${results.passed + results.failed}`, 'blue');
  
  if (results.failed === 0) {
    log('\n🎉 All tests passed! Integration is working correctly.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Check the backend server logs.', 'yellow');
  }
  
  log('\n' + '='.repeat(50) + '\n', 'blue');
}

// Check if server is running
async function checkServer() {
  try {
    await fetch(`${API_URL}/health`);
    return true;
  } catch (error) {
    log(`\n❌ Cannot connect to backend server at ${API_URL}`, 'red');
    log(`   Make sure the server is running: cd server && npm run dev\n`, 'yellow');
    return false;
  }
}

// Run tests
(async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runTests();
  }
  process.exit(0);
})();
