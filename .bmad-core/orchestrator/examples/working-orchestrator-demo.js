// BMAD™ Orchestrator - Working Demo Script
// Copyright © 2025 BMAD™. All rights reserved.

/**
 * This script demonstrates the BMAD™ Orchestrator in action with mock agents.
 * It shows how the orchestrator coordinates workflow management, agent interactions,
 * and resource allocation in a realistic software development scenario.
 */

const { BMADOrchestrator } = require('../orchestrator/index');

// Mock store_memory function for demonstration
global.store_memory = (data) => {
  console.log(`[MEMORY] Stored: ${data.content}`);
};

// Create orchestrator instance
const orchestrator = new BMADOrchestrator();

console.log('🚀 BMAD™ Orchestrator Demo');
console.log('=========================\n');

// 1. Show available commands
console.log('1. Available Commands');
console.log('-------------------');
console.log(orchestrator.help());
console.log('\n');

// 2. Show system status
console.log('2. System Status');
console.log('--------------');
const status = orchestrator.status();
console.log(JSON.stringify(status, null, 2));
console.log('\n');

// 3. List available agents
console.log('3. Available Agents');
console.log('-----------------');
const agents = orchestrator.agents();
console.log(JSON.stringify(agents, null, 2));
console.log('\n');

// 4. List workflows
console.log('4. Active Workflows');
console.log('-----------------');
const workflows = orchestrator.workflows();
console.log(JSON.stringify(workflows, null, 2));
console.log('\n');

// 5. Create a new workflow
console.log('5. Creating New Workflow');
console.log('----------------------');
try {
  const workflowResult = orchestrator.createWorkflow(
    'E-commerce Platform Development',
    ['business-analyst', 'ux-designer', 'architect', 'frontend-dev', 'backend-dev', 'qa-engineer'],
    ['requirements', 'design', 'frontend-development', 'backend-development', 'testing', 'deployment']
  );
  console.log('Workflow created successfully:');
  console.log(JSON.stringify(workflowResult, null, 2));
  console.log('\n');
  
  const workflowId = workflowResult.workflowId;
  
  // 6. Register mock agents
  console.log('6. Registering Mock Agents');
  console.log('------------------------');
  orchestrator.agentCoordinator.registerAgent('analyst1', 'business-analyst', {
    skills: ['market-research', 'requirements-analysis']
  });
  console.log('Registered business analyst');
  
  orchestrator.agentCoordinator.registerAgent('designer1', 'ux-designer', {
    skills: ['wireframing', 'prototyping']
  });
  console.log('Registered UX designer');
  
  orchestrator.agentCoordinator.registerAgent('architect1', 'architect', {
    skills: ['system-design', 'database-modeling']
  });
  console.log('Registered architect');
  
  orchestrator.agentCoordinator.registerAgent('frontend1', 'frontend-dev', {
    skills: ['react', 'javascript', 'css']
  });
  console.log('Registered frontend developer');
  
  orchestrator.agentCoordinator.registerAgent('backend1', 'backend-dev', {
    skills: ['nodejs', 'express', 'mongodb']
  });
  console.log('Registered backend developer');
  
  orchestrator.agentCoordinator.registerAgent('qa1', 'qa-engineer', {
    skills: ['automated-testing', 'manual-testing']
  });
  console.log('Registered QA engineer');
  console.log('\n');
  
  // 7. Delegate tasks to agents
  console.log('7. Delegating Tasks');
  console.log('-----------------');
  const delegate1 = orchestrator.delegate(
    'Gather detailed business requirements for e-commerce platform',
    'business-analyst',
    'E-commerce platform requirements gathering'
  );
  console.log('Task delegated to business analyst:', JSON.stringify(delegate1, null, 2));
  
  const delegate2 = orchestrator.delegate(
    'Create wireframes and user flow diagrams for e-commerce platform',
    'ux-designer',
    'E-commerce platform UI/UX design'
  );
  console.log('Task delegated to UX designer:', JSON.stringify(delegate2, null, 2));
  
  const delegate3 = orchestrator.delegate(
    'Design system architecture and database schema for e-commerce platform',
    'architect',
    'E-commerce platform architecture design'
  );
  console.log('Task delegated to architect:', JSON.stringify(delegate3, null, 2));
  console.log('\n');
  
  // 8. Coordinate between agents
  console.log('8. Coordinating Agents');
  console.log('--------------------');
  const coordinateResult = orchestrator.coordinate(
    ['frontend1', 'backend1'],
    'Integrate frontend and backend APIs for user authentication',
    '3 days'
  );
  console.log('Agents coordinated:', JSON.stringify(coordinateResult, null, 2));
  console.log('\n');
  
  // 9. Monitor system health
  console.log('9. Monitoring System Health');
  console.log('--------------------------');
  const healthMonitor = orchestrator.monitor('health', ['cpu', 'memory', 'disk']);
  console.log('Health monitoring result:', JSON.stringify(healthMonitor, null, 2));
  console.log('\n');
  
  // 10. Optimize resource allocation
  console.log('10. Optimizing Resource Allocation');
  console.log('--------------------------------');
  const optimization = orchestrator.optimize('resources', { maxUtilization: 80 });
  console.log('Resource optimization result:', JSON.stringify(optimization, null, 2));
  console.log('\n');
  
  // 11. Generate performance report
  console.log('11. Generating Performance Report');
  console.log('-------------------------------');
  const report = orchestrator.report('performance', ['management', 'engineering'], 'weekly');
  console.log('Performance report generated:', JSON.stringify(report, null, 2));
  console.log('\n');
  
  // 12. Show updated workflow status
  console.log('12. Updated Workflow Status');
  console.log('-------------------------');
  const updatedWorkflows = orchestrator.workflows();
  console.log(JSON.stringify(updatedWorkflows, null, 2));
  console.log('\n');
  
  // 13. Show updated agent status
  console.log('13. Updated Agent Status');
  console.log('----------------------');
  const updatedAgents = orchestrator.agents();
  console.log(JSON.stringify(updatedAgents, null, 2));
  console.log('\n');
  
  console.log('🎉 Demo completed successfully!');
  console.log('The orchestrator has demonstrated its core capabilities including:');
  console.log('- Workflow management');
  console.log('- Agent coordination');
  console.log('- Task delegation');
  console.log('- Performance monitoring');
  console.log('- Resource optimization');
  console.log('- Reporting');
  
} catch (error) {
  console.error('❌ Error in demo:', error.message);
}