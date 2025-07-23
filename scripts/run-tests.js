#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Simple test runner for npm script usage
function runTests() {
  console.log('🚀 Starting automated test suite...\n');
  
  const jestPath = path.join(__dirname, '..', 'node_modules', '.bin', 'jest');
  const configPath = path.join(__dirname, '..', 'jest.config.js');
  
  const jest = spawn('node', [jestPath, '--config', configPath], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'test'
    }
  });

  jest.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ All tests passed successfully!');
    } else {
      console.log('\n❌ Some tests failed. Please check the output above.');
      process.exit(code);
    }
  });

  jest.on('error', (err) => {
    console.error('Failed to start test runner:', err);
    process.exit(1);
  });
}

// Run tests when called directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };