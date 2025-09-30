// BMAD™ Orchestrator - Cross-Module Integration Tests
// Copyright © 2025 BMAD™. All rights reserved.

const { BMADOrchestrator } = require('../orchestrator/index');

// Mock store_memory function for testing
global.store_memory = jest.fn();

describe('Orchestrator Cross-Module Integration', () => {
  let orchestrator;

  beforeEach(() => {
    orchestrator = new BMADOrchestrator();
    global.store_memory.mockClear();
  });

  test('should integrate workflow management with agent coordination', () => {
    // Create a workflow
    const workflowResult = orchestrator.createWorkflow('Integration Test', ['developer', 'tester'], ['development', 'testing']);
    const workflowId = workflowResult.workflowId;
    
    // Register agents
    orchestrator.agentCoordinator.registerAgent('dev1', 'developer', { languages: ['javascript'] });
    orchestrator.agentCoordinator.registerAgent('test1', 'tester', { tools: ['jest'] });
    
    // Assign workload to agents
    const devWorkload = { id: 'dev-task-1', workflowId, phase: 'development', description: 'Implement feature' };
    const testWorkload = { id: 'test-task-1', workflowId, phase: 'testing', description: 'Test feature' };
    
    orchestrator.agentCoordinator.assignWorkload('dev1', devWorkload);
    orchestrator.agentCoordinator.assignWorkload('test1', testWorkload);
    
    // Verify workflow has agents assigned
    const workflow = orchestrator.workflowManager.workflows.get(workflowId);
    expect(workflow.agents).toEqual(['developer', 'tester']);
    
    // Verify agents have workloads
    const devAgent = orchestrator.agentCoordinator.agents.get('dev1');
    const testAgent = orchestrator.agentCoordinator.agents.get('test1');
    
    expect(devAgent.currentWorkload).toContainEqual(devWorkload);
    expect(testAgent.currentWorkload).toContainEqual(testWorkload);
  });

  test('should integrate resource management with workflow execution', () => {
    // Create a workflow
    const workflowResult = orchestrator.createWorkflow('Resource Test', ['developer'], ['development']);
    const workflowId = workflowResult.workflowId;
    
    // Register resources
    orchestrator.resourceManager.registerResource('compute1', 'compute', { cpu: '4-core', ram: '16GB' });
    orchestrator.resourceManager.registerResource('storage1', 'storage', { type: 'SSD', size: '1TB' });
    
    // Allocate resources to workflow
    orchestrator.resourceManager.allocateResource('compute1', workflowId);
    orchestrator.resourceManager.allocateResource('storage1', workflowId);
    
    // Verify resources are allocated
    const computeResource = orchestrator.resourceManager.resources.get('compute1');
    const storageResource = orchestrator.resourceManager.resources.get('storage1');
    
    expect(computeResource.status).toBe('allocated');
    expect(computeResource.allocatedTo).toBe(workflowId);
    expect(storageResource.status).toBe('allocated');
    expect(storageResource.allocatedTo).toBe(workflowId);
    
    // Verify workflow shows in allocations
    const allocations = orchestrator.resourceManager.getAllocations(workflowId);
    expect(allocations).toContain('compute1');
    expect(allocations).toContain('storage1');
  });

  test('should integrate performance monitoring with workflow execution', () => {
    // Create a workflow
    orchestrator.createWorkflow('Performance Test', ['developer', 'tester'], ['development', 'testing']);
    
    // Get performance metrics
    const metrics = orchestrator.performanceMonitor.getWorkflowMetrics();
    expect(metrics).toBeDefined();
    
    // Check for bottlenecks
    const bottlenecks = orchestrator.performanceMonitor.detectBottlenecks();
    expect(bottlenecks).toBeDefined();
    
    // Perform health check
    const healthCheck = orchestrator.performanceMonitor.performHealthCheck();
    expect(healthCheck).toBeDefined();
    expect(healthCheck.systemHealth).toBe('operational');
  });

  test('should integrate escalation management with workflow issues', () => {
    // Define escalation path
    orchestrator.escalationManager.defineEscalationPath('technical', ['developer', 'architect', 'cto']);
    
    // Create a workflow
    const workflowResult = orchestrator.createWorkflow('Escalation Test', ['developer'], ['development']);
    const workflowId = workflowResult.workflowId;
    
    // Register agent
    orchestrator.agentCoordinator.registerAgent('dev1', 'developer', { languages: ['javascript'] });
    
    // Simulate an issue that requires escalation
    const escalation = orchestrator.escalate('Build failure', 'Compilation error in workflow', 'high');
    
    // Verify escalation
    expect(escalation.success).toBe(true);
    expect(escalation.issueType).toBe('technical');
    
    // Verify escalation is active
    const activeEscalations = orchestrator.escalationManager.getActiveEscalations();
    expect(activeEscalations.length).toBe(1);
    
    // Resolve escalation
    orchestrator.escalationManager.resolveEscalation(activeEscalations[0].id, 'Fixed dependency issue');
    
    // Verify no active escalations
    const remainingEscalations = orchestrator.escalationManager.getActiveEscalations();
    expect(remainingEscalations.length).toBe(0);
  });

  test('should coordinate complex multi-agent workflow', () => {
    // Create a complex workflow
    const workflowResult = orchestrator.createWorkflow(
      'Enterprise App Development', 
      ['analyst', 'architect', 'developer', 'tester', 'devops'], 
      ['requirements', 'design', 'implementation', 'testing', 'deployment']
    );
    const workflowId = workflowResult.workflowId;
    
    // Register all agents
    orchestrator.agentCoordinator.registerAgent('analyst1', 'analyst', { skills: ['research', 'analysis'] });
    orchestrator.agentCoordinator.registerAgent('architect1', 'architect', { skills: ['design', 'planning'] });
    orchestrator.agentCoordinator.registerAgent('dev1', 'developer', { languages: ['javascript', 'python'] });
    orchestrator.agentCoordinator.registerAgent('tester1', 'tester', { tools: ['jest', 'selenium'] });
    orchestrator.agentCoordinator.registerAgent('devops1', 'devops', { skills: ['docker', 'kubernetes'] });
    
    // Register resources
    orchestrator.resourceManager.registerResource('compute1', 'compute', { cpu: '8-core', ram: '32GB' });
    orchestrator.resourceManager.registerResource('storage1', 'storage', { type: 'SSD', size: '2TB' });
    orchestrator.resourceManager.registerResource('database1', 'database', { type: 'PostgreSQL', version: '13' });
    
    // Allocate resources to workflow
    orchestrator.resourceManager.allocateResource('compute1', workflowId);
    orchestrator.resourceManager.allocateResource('storage1', workflowId);
    orchestrator.resourceManager.allocateResource('database1', workflowId);
    
    // Assign workloads to agents
    const requirementsWorkload = { id: 'req-1', workflowId, phase: 'requirements', description: 'Gather requirements' };
    const designWorkload = { id: 'des-1', workflowId, phase: 'design', description: 'Create system design' };
    const implementationWorkload = { id: 'impl-1', workflowId, phase: 'implementation', description: 'Implement features' };
    const testingWorkload = { id: 'test-1', workflowId, phase: 'testing', description: 'Test implementation' };
    const deploymentWorkload = { id: 'dep-1', workflowId, phase: 'deployment', description: 'Deploy to production' };
    
    orchestrator.agentCoordinator.assignWorkload('analyst1', requirementsWorkload);
    orchestrator.agentCoordinator.assignWorkload('architect1', designWorkload);
    orchestrator.agentCoordinator.assignWorkload('dev1', implementationWorkload);
    orchestrator.agentCoordinator.assignWorkload('tester1', testingWorkload);
    orchestrator.agentCoordinator.assignWorkload('devops1', deploymentWorkload);
    
    // Verify workflow state
    const workflow = orchestrator.workflowManager.workflows.get(workflowId);
    expect(workflow.name).toBe('Enterprise App Development');
    expect(workflow.agents.length).toBe(5);
    expect(workflow.phases.length).toBe(5);
    
    // Verify agent workloads
    expect(orchestrator.agentCoordinator.agents.get('analyst1').currentWorkload).toContainEqual(requirementsWorkload);
    expect(orchestrator.agentCoordinator.agents.get('architect1').currentWorkload).toContainEqual(designWorkload);
    expect(orchestrator.agentCoordinator.agents.get('dev1').currentWorkload).toContainEqual(implementationWorkload);
    expect(orchestrator.agentCoordinator.agents.get('tester1').currentWorkload).toContainEqual(testingWorkload);
    expect(orchestrator.agentCoordinator.agents.get('devops1').currentWorkload).toContainEqual(deploymentWorkload);
    
    // Verify resource allocation
    const allocations = orchestrator.resourceManager.getAllocations(workflowId);
    expect(allocations.length).toBe(3);
    expect(allocations).toContain('compute1');
    expect(allocations).toContain('storage1');
    expect(allocations).toContain('database1');
    
    // Verify performance monitoring
    const metrics = orchestrator.performanceMonitor.getWorkflowMetrics();
    expect(metrics).toBeDefined();
    
    // Test workflow modification
    orchestrator.modifyWorkflow(workflowId, { status: 'in-progress' });
    const updatedWorkflow = orchestrator.workflowManager.workflows.get(workflowId);
    expect(updatedWorkflow.status).toBe('in-progress');
    
    // Test workflow visualization
    const visualization = orchestrator.workflowManager.getWorkflowVisualization(workflowId);
    expect(visualization).toBeDefined();
    expect(typeof visualization).toBe('string');
  });

  test('should handle workflow completion and archiving', () => {
    // Create a workflow
    const workflowResult = orchestrator.createWorkflow('Completion Test', ['developer'], ['development']);
    const workflowId = workflowResult.workflowId;
    
    // Register agent and assign workload
    orchestrator.agentCoordinator.registerAgent('dev1', 'developer', { languages: ['javascript'] });
    const workload = { id: 'task-1', workflowId, phase: 'development', description: 'Implement feature' };
    orchestrator.agentCoordinator.assignWorkload('dev1', workload);
    
    // Complete workflow by removing workload
    orchestrator.agentCoordinator.removeWorkload('dev1', 'task-1');
    
    // Archive workflow
    const lessonsLearned = 'Team communicated well throughout the project';
    const archiveResult = orchestrator.archiveWorkflow(workflowId, lessonsLearned);
    
    // Verify workflow is archived
    expect(archiveResult.success).toBe(true);
    const archivedWorkflow = orchestrator.workflowManager.workflows.get(workflowId);
    expect(archivedWorkflow.status).toBe('archived');
    expect(archivedWorkflow.lessonsLearned).toBe(lessonsLearned);
  });

  test('should balance workload across agents', () => {
    // Register multiple agents
    orchestrator.agentCoordinator.registerAgent('dev1', 'developer', { languages: ['javascript'] });
    orchestrator.agentCoordinator.registerAgent('dev2', 'developer', { languages: ['python'] });
    orchestrator.agentCoordinator.registerAgent('dev3', 'developer', { languages: ['java'] });
    
    // Assign multiple workloads to first agent
    const workload1 = { id: 'task-1', description: 'Task 1' };
    const workload2 = { id: 'task-2', description: 'Task 2' };
    const workload3 = { id: 'task-3', description: 'Task 3' };
    const workload4 = { id: 'task-4', description: 'Task 4' };
    
    orchestrator.agentCoordinator.assignWorkload('dev1', workload1);
    orchestrator.agentCoordinator.assignWorkload('dev1', workload2);
    orchestrator.agentCoordinator.assignWorkload('dev1', workload3);
    orchestrator.agentCoordinator.assignWorkload('dev1', workload4);
    
    // Verify initial state
    const initialAgent = orchestrator.agentCoordinator.agents.get('dev1');
    expect(initialAgent.currentWorkload.length).toBe(4);
    
    // Balance workload
    orchestrator.balanceLoad(['dev1', 'dev2', 'dev3'], 'even');
    
    // Verify balanced state
    const balancedAgent1 = orchestrator.agentCoordinator.agents.get('dev1');
    const balancedAgent2 = orchestrator.agentCoordinator.agents.get('dev2');
    const balancedAgent3 = orchestrator.agentCoordinator.agents.get('dev3');
    
    // Each agent should have approximately the same number of tasks
    expect(balancedAgent1.currentWorkload.length).toBeGreaterThanOrEqual(1);
    expect(balancedAgent2.currentWorkload.length).toBeGreaterThanOrEqual(1);
    expect(balancedAgent3.currentWorkload.length).toBeGreaterThanOrEqual(1);
  });

  test('should coordinate handoff between agents', () => {
    // Register agents
    orchestrator.agentCoordinator.registerAgent('dev1', 'developer', { languages: ['javascript'] });
    orchestrator.agentCoordinator.registerAgent('test1', 'tester', { tools: ['jest'] });
    
    // Create workload
    const workload = { id: 'feature-1', description: 'Implement and test feature' };
    
    // Assign to developer
    orchestrator.agentCoordinator.assignWorkload('dev1', workload);
    
    // Verify assignment
    let devAgent = orchestrator.agentCoordinator.agents.get('dev1');
    expect(devAgent.currentWorkload).toContain(workload);
    
    // Coordinate handoff to tester
    orchestrator.handoff('dev1', 'test1', workload);
    
    // Verify handoff
    devAgent = orchestrator.agentCoordinator.agents.get('dev1');
    const testAgent = orchestrator.agentCoordinator.agents.get('test1');
    
    expect(devAgent.currentWorkload).not.toContain(workload);
    expect(testAgent.currentWorkload).toContain(workload);
  });

  test('should resolve conflicts between agents', () => {
    // Register agents
    orchestrator.agentCoordinator.registerAgent('dev1', 'developer', { languages: ['javascript'] });
    orchestrator.agentCoordinator.registerAgent('arch1', 'architect', { domains: ['frontend'] });
    
    // Simulate a conflict
    const resolution = orchestrator.conflictResolution(['dev1', 'arch1'], 'Component design disagreement');
    
    // Verify resolution
    expect(resolution.success).toBe(true);
    expect(resolution.resolution.resolved).toBe(true);
    expect(resolution.resolution.resolutionMethod).toBe('mediation');
  });

  test('should optimize resource allocation', () => {
    // Register resources
    orchestrator.resourceManager.registerResource('compute1', 'compute', { cpu: '4-core', ram: '16GB' });
    orchestrator.resourceManager.registerResource('compute2', 'compute', { cpu: '8-core', ram: '32GB' });
    orchestrator.resourceManager.registerResource('storage1', 'storage', { type: 'SSD', size: '1TB' });
    
    // Allocate some resources
    orchestrator.resourceManager.allocateResource('compute1', 'workflow1');
    orchestrator.resourceManager.allocateResource('storage1', 'workflow1');
    
    // Optimize allocation
    const optimization = orchestrator.optimize('resources', {});
    
    // Verify optimization results
    expect(optimization.results).toBeDefined();
    expect(optimization.results.available).toBe(1); // Only compute2 should be available
    expect(optimization.results.allocated).toBe(2); // compute1 and storage1 should be allocated
  });

  test('should plan capacity for upcoming workloads', () => {
    // Register resources
    orchestrator.resourceManager.registerResource('compute1', 'compute', { cpu: '4-core', ram: '16GB' });
    orchestrator.resourceManager.registerResource('storage1', 'storage', { type: 'SSD', size: '1TB' });
    
    // Plan capacity for upcoming workloads
    const upcomingWorkloads = [
      { type: 'compute', requirements: { cpu: '4-core' } },
      { type: 'storage', requirements: { size: '500GB' } },
      { type: 'compute', requirements: { cpu: '8-core' } } // This will create shortfall
    ];
    
    const plan = orchestrator.resourceManager.planCapacity(upcomingWorkloads);
    
    // Verify capacity plan
    expect(plan).toBeDefined();
    expect(plan.currentCapacity).toBe(2);
    expect(plan.projectedDemand).toBe(3);
    expect(plan.shortfall).toBe(1);
    expect(plan.recommendations.length).toBeGreaterThan(0);
  });

  test('should generate comprehensive status report', () => {
    // Create a workflow
    orchestrator.createWorkflow('Status Report Test', ['developer'], ['development']);
    
    // Register an agent
    orchestrator.agentCoordinator.registerAgent('dev1', 'developer', { languages: ['javascript'] });
    
    // Register a resource
    orchestrator.resourceManager.registerResource('compute1', 'compute', { cpu: '4-core', ram: '16GB' });
    
    // Generate status report
    const status = orchestrator.status();
    
    // Verify status report
    expect(status).toBeDefined();
    expect(status.timestamp).toBeDefined();
    expect(status.summary).toBeDefined();
    expect(status.summary.active_workflows).toBe(1);
    expect(status.summary.total_agents).toBe(1);
    expect(status.summary.allocated_resources).toBe(0); // Resource not yet allocated
    
    // Allocate resource and check again
    orchestrator.resourceManager.allocateResource('compute1', 'workflow-123');
    const updatedStatus = orchestrator.status();
    expect(updatedStatus.summary.allocated_resources).toBe(1);
  });
});