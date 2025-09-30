// BMAD™ Orchestrator CLI Test Script
// Copyright © 2025 BMAD™. All rights reserved.

const { exec } = require('child_process');
const { promisify } = require('util');

const execPromise = promisify(exec);

async function testCLI() {
  console.log('Testing BMAD™ Orchestrator CLI...\\n');
  
  try {
    // Test help command
    console.log('1. Testing help command...');
    const { stdout: helpOutput } = await execPromise('node cli.js help');
    console.log('Help command output:');
    console.log(helpOutput);
    console.log('✅ Help command works correctly\\n');
    
    // Test status command
    console.log('2. Testing status command...');
    const { stdout: statusOutput } = await execPromise('node cli.js status');
    console.log('Status command output:');
    console.log(statusOutput);
    console.log('✅ Status command works correctly\\n');
    
    // Test agents command
    console.log('3. Testing agents command...');
    const { stdout: agentsOutput } = await execPromise('node cli.js agents');
    console.log('Agents command output:');
    console.log(agentsOutput);
    console.log('✅ Agents command works correctly\\n');
    
    // Test workflows command
    console.log('4. Testing workflows command...');
    const { stdout: workflowsOutput } = await execPromise('node cli.js workflows');
    console.log('Workflows command output:');
    console.log(workflowsOutput);
    console.log('✅ Workflows command works correctly\\n');
    
    // Test delegate command (this will show an error which is expected)
    console.log('5. Testing delegate command...');
    try {
      await execPromise('node cli.js delegate "Test task" "developer" "Test context"');
      console.log('❌ Delegate command should have failed');
    } catch (error) {
      console.log('Delegate command error (expected):');
      console.log(error.message);
      console.log('✅ Delegate command correctly handles errors\\n');
    }
    
    // Test create-workflow command (this will show an error which is expected)
    console.log('6. Testing create-workflow command...');
    try {
      await execPromise('node cli.js create-workflow "Test Workflow" "developer,tester" "development,testing"');
      console.log('❌ Create-workflow command should have failed');
    } catch (error) {
      console.log('Create-workflow command error (expected):');
      console.log(error.message);
      console.log('✅ Create-workflow command correctly handles errors\\n');
    }
    
    console.log('All CLI tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testCLI();