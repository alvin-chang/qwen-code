// BMAD™ Orchestrator - Usage Example
// Copyright © 2025 BMAD™. All rights reserved.

const { BMADOrchestrator } = require('./index');

// Create an instance of the orchestrator
const orchestrator = new BMADOrchestrator();

console.log('=== BMAD Orchestrator Usage Examples ===\n');

// Display help
console.log('1. Help Information:');
console.log(orchestrator.help());

// Display status
console.log('\n2. Current Status:');
console.log(JSON.stringify(orchestrator.status(), null, 2));

// List agents
console.log('\n3. Available Agents:');
console.log(JSON.stringify(orchestrator.agents(), null, 2));

// List workflows
console.log('\n4. Active Workflows:');
console.log(JSON.stringify(orchestrator.workflows(), null, 2));

// Example of delegating a task
console.log('\n5. Delegate Task Example:');
try {
  // First, we need to register an agent to delegate to
  // In a real scenario, agents would be registered by the system
  const result = orchestrator.delegate(
    "Implement user authentication", 
    "developer", 
    "Frontend module for login/signup"
  );
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.log('Note: Task delegation failed because no agents are registered in this example');
  console.log('In a real implementation, agents would be registered before delegation');
}

// Example of creating a workflow
console.log('\n6. Create Workflow Example:');
try {
  const workflowId = orchestrator.createWorkflow(
    "User Profile Management",
    ["developer", "qa", "ux"],
    ["design", "implementation", "testing", "deployment"]
  );
  console.log(`Created workflow with ID: ${workflowId}`);
  
  // Show the created workflow
  const workflows = orchestrator.workflows();
  const createdWorkflow = workflows.find(w => w.id === workflowId);
  console.log(JSON.stringify(createdWorkflow, null, 2));
} catch (error) {
  console.log('Error creating workflow:', error.message);
}

console.log('\n=== CLI Usage ===');
console.log('To use the orchestrator CLI, run:');
console.log('  npm run orchestrator:cli help');
console.log('  node bmad-core/orchestrator/cli.js status');
console.log('See CLI-README.md for detailed usage instructions.');

console.log('\n=== Example Complete ===');