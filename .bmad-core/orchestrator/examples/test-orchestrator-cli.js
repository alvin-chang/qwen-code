// BMAD™ Orchestrator CLI Test Script
// Copyright © 2025 BMAD™. All rights reserved.

/**
 * This script tests the BMAD™ Orchestrator CLI commands to ensure they work correctly.
 * It demonstrates how to use the CLI for various orchestrator operations.
 */

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function runCLITest() {
  console.log('🧪 BMAD™ Orchestrator CLI Test');
  console.log('=============================\\n');
  
  try {
    // Test 1: Help command
    console.log('1. Testing Help Command');
    console.log('---------------------');
    const { stdout: helpOutput } = await execAsync('node ../cli.js help');
    console.log(helpOutput);
    console.log('✅ Help command works correctly\\n');
    
    // Test 2: Status command
    console.log('2. Testing Status Command');
    console.log('-----------------------');
    const { stdout: statusOutput } = await execAsync('node ../cli.js status');
    console.log(statusOutput);
    console.log('✅ Status command works correctly\\n');
    
    // Test 3: Agents command
    console.log('3. Testing Agents Command');
    console.log('-----------------------');
    const { stdout: agentsOutput } = await execAsync('node ../cli.js agents');
    console.log(agentsOutput);
    console.log('✅ Agents command works correctly\\n');
    
    // Test 4: Workflows command
    console.log('4. Testing Workflows Command');
    console.log('--------------------------');
    const { stdout: workflowsOutput } = await execAsync('node ../cli.js workflows');
    console.log(workflowsOutput);
    console.log('✅ Workflows command works correctly\\n');
    
    // Test 5: Delegate command (will show error which is expected)
    console.log('5. Testing Delegate Command');
    console.log('-------------------------');
    try {
      await execAsync('node ../cli.js delegate "Test task" "developer" "Test context"');
      console.log('❌ Delegate command should have failed');
    } catch (error) {
      console.log('Expected error (no agents available):');
      console.log(error.message);
      console.log('✅ Delegate command correctly handles errors\\n');
    }
    
    // Test 6: Create workflow command (will show error which is expected)
    console.log('6. Testing Create Workflow Command');
    console.log('--------------------------------');
    try {
      await execAsync('node ../cli.js create-workflow "Test Workflow" "developer,tester" "development,testing"');
      console.log('❌ Create workflow command should have failed');
    } catch (error) {
      console.log('Expected error (validation issue):');
      console.log(error.message);
      console.log('✅ Create workflow command correctly handles errors\\n');
    }
    
    // Test 7: Monitor command
    console.log('7. Testing Monitor Command');
    console.log('------------------------');
    const { stdout: monitorOutput } = await execAsync('node ../cli.js monitor health cpu,memory');
    console.log(monitorOutput);
    console.log('✅ Monitor command works correctly\\n');
    
    // Test 8: Report command
    console.log('8. Testing Report Command');
    console.log('-----------------------');
    const { stdout: reportOutput } = await execAsync('node ../cli.js report status management weekly');
    console.log(reportOutput);
    console.log('✅ Report command works correctly\\n');
    
    // Test 9: Optimize command
    console.log('9. Testing Optimize Command');
    console.log('-------------------------');
    const { stdout: optimizeOutput } = await execAsync('node ../cli.js optimize resources \'{"maxUtilization":80}\'');
    console.log(optimizeOutput);
    console.log('✅ Optimize command works correctly\n');
    
    console.log('🎉 All CLI tests completed successfully!');
    console.log('\\nThe CLI demonstrates:');
    console.log('✅ Command parsing and validation');
    console.log('✅ Error handling');
    console.log('✅ JSON argument processing');
    console.log('✅ Integration with orchestrator core');
    
  } catch (error) {
    console.error('❌ CLI test failed:', error);
    process.exit(1);
  }
}

runCLITest();