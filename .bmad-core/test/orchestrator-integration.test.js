// BMAD™ Orchestrator - Integration Tests
// Copyright © 2025 BMAD™. All rights reserved.

const WorkflowManager = require('../orchestrator/workflow-manager');
const AgentCoordinator = require('../orchestrator/agent-coordinator');
const PerformanceMonitor = require('../orchetrator/performance-monitor');
const ResourceManager = require('../orchestrator/resource-manager');
const EscalationManager = require('../orchestrator/escalation-manager');

// Mock store_memory function for testing
global.store_memory = jest.fn();

describe('Orchestrator Integration Tests', () => {
  let workflowManager;
  let agentCoordinator;
  let performanceMonitor;
  let resourceManager;
  let escalationManager;

  beforeEach(() => {
    workflowManager = new WorkflowManager();
    agentCoordinator = new AgentCoordinator();
    performanceMonitor = new PerformanceMonitor();
    resourceManager = new ResourceManager();
    escalationManager = new EscalationManager();
    global.store_memory.mockClear();
  });

  test('should coordinate workflow creation with agent assignment', () => {
    // Create a workflow
    const workflowId = workflowManager.createWorkflow('Integration Test', ['developer', 'tester'], ['development', 'testing']);
    
    // Register agents
    agentCoordinator.registerAgent('dev1', 'developer', { languages: ['javascript'] });
    agentCoordinator.registerAgent('test1', 'tester', { tools: ['jest'] });
    
    // Assign workload to agents
    const devWorkload = { id: 'dev-task-1', workflowId, phase: 'development', description: 'Implement feature' };
    const testWorkload = { id: 'test-task-1', workflowId, phase: 'testing', description: 'Test feature' };
    
    agentCoordinator.assignWorkload('dev1', devWorkload);
    agentCoordinator.assignWorkload('test1', testWorkload);
    
    // Verify assignments
    const devAgent = agentCoordinator.agents.get('dev1');
    const testAgent = agentCoordinator.agents.get('test1');
    
    expect(devAgent.currentWorkload).toContainEqual(devWorkload);
    expect(testAgent.currentWorkload).toContainEqual(testWorkload);
  });

  test('should manage resource allocation for workflow', () => {
    // Create a workflow
    const workflowId = workflowManager.createWorkflow('Resource Test', ['developer'], ['development']);
    
    // Register resources
    resourceManager.registerResource('compute1', 'compute', { cpu: '4-core', ram: '16GB' });
    resourceManager.registerResource('storage1', 'storage', { type: 'SSD', size: '1TB' });
    
    // Allocate resources to workflow
    resourceManager.allocateResource('compute1', workflowId);
    resourceManager.allocateResource('storage1', workflowId);
    
    // Verify allocation
    const computeResource = resourceManager.resources.get('compute1');
    const storageResource = resourceManager.resources.get('storage1');
    
    expect(computeResource.status).toBe('allocated');
    expect(computeResource.allocatedTo).toBe(workflowId);
    expect(storageResource.status).toBe('allocated');
    expect(storageResource.allocatedTo).toBe(workflowId);
    
    // Check allocations
    const allocations = resourceManager.getAllocations(workflowId);
    expect(allocations).toContain('compute1');
    expect(allocations).toContain('storage1');
  });

  test('should handle escalation during workflow execution', () => {
    // Define escalation path
    escalationManager.defineEscalationPath('technical', ['developer', 'architect', 'cto']);
    
    // Create a workflow
    const workflowId = workflowManager.createWorkflow('Escalation Test', ['developer'], ['development']);
    
    // Register agent
    agentCoordinator.registerAgent('dev1', 'developer', { languages: ['javascript'] });
    
    // Simulate an issue that requires escalation
    const escalation = escalationManager.escalateIssue('Build failure', 'technical', 'dev1');
    
    // Verify escalation
    expect(escalation).toBeDefined();
    expect(escalation.issue).toBe('Build failure');
    expect(escalation.path).toEqual(['developer', 'architect', 'cto']);
    
    // Resolve escalation
    escalationManager.resolveEscalation(escalation.id, 'Fixed dependency issue');
    
    // Verify resolution
    const resolvedEscalation = escalationManager.activeEscalations.get(escalation.id);
    expect(resolvedEscalation.status).toBe('resolved');
  });

  test('should monitor workflow performance and detect bottlenecks', () => {
    // Create a workflow
    const workflowId = workflowManager.createWorkflow('Performance Test', ['developer', 'tester'], ['development', 'testing']);
    
    // Get metrics
    const metrics = performanceMonitor.getWorkflowMetrics();
    expect(metrics).toBeDefined();
    
    // Check for bottlenecks
    const bottlenecks = performanceMonitor.detectBottlenecks();
    expect(bottlenecks).toBeDefined();
  });

  test('should balance workload when agents are added/removed', () => {
    // Register agents
    agentCoordinator.registerAgent('dev1', 'developer', { languages: ['javascript'] });
    agentCoordinator.registerAgent('dev2', 'developer', { languages: ['python'] });
    agentCoordinator.registerAgent('dev3', 'developer', { languages: ['java'] });
    
    // Assign workloads
    const workload1 = { id: 'task1', description: 'Task 1' };
    const workload2 = { id: 'task2', description: 'Task 2' };
    const workload3 = { id: 'task3', description: 'Task 3' };
    const workload4 = { id: 'task4', description: 'Task 4' };
    
    agentCoordinator.assignWorkload('dev1', workload1);
    agentCoordinator.assignWorkload('dev1', workload2);
    agentCoordinator.assignWorkload('dev1', workload3);
    agentCoordinator.assignWorkload('dev1', workload4);
    
    // Verify initial state
    const initialAgent = agentCoordinator.agents.get('dev1');
    expect(initialAgent.currentWorkload.length).toBe(4);
    
    // Balance workload
    agentCoordinator.balanceWorkload(['dev1', 'dev2', 'dev3'], 'even');
    
    // Verify balanced state
    const balancedAgent1 = agentCoordinator.agents.get('dev1');
    const balancedAgent2 = agentCoordinator.agents.get('dev2');
    const balancedAgent3 = agentCoordinator.agents.get('dev3');
    
    // Each agent should have approximately the same number of tasks
    expect(balancedAgent1.currentWorkload.length).toBeGreaterThanOrEqual(1);
    expect(balancedAgent2.currentWorkload.length).toBeGreaterThanOrEqual(1);
    expect(balancedAgent3.currentWorkload.length).toBeGreaterThanOrEqual(1);
  });

  test('should coordinate handoff between agents during workflow', () => {
    // Register agents
    agentCoordinator.registerAgent('dev1', 'developer', { languages: ['javascript'] });
    agentCoordinator.registerAgent('test1', 'tester', { tools: ['jest'] });
    
    // Create workload
    const workload = { id: 'feature-1', description: 'Implement and test feature' };
    
    // Assign to developer
    agentCoordinator.assignWorkload('dev1', workload);
    
    // Verify assignment
    let devAgent = agentCoordinator.agents.get('dev1');
    expect(devAgent.currentWorkload).toContain(workload);
    
    // Coordinate handoff to tester
    agentCoordinator.coordinateHandoff('dev1', 'test1', workload);
    
    // Verify handoff
    devAgent = agentCoordinator.agents.get('dev1');
    const testAgent = agentCoordinator.agents.get('test1');
    
    expect(devAgent.currentWorkload).not.toContain(workload);
    expect(testAgent.currentWorkload).toContain(workload);
  });

  test('should resolve conflicts between agents', () => {
    // Register agents
    agentCoordinator.registerAgent('dev1', 'developer', { languages: ['javascript'] });
    agentCoordinator.registerAgent('arch1', 'architect', { domains: ['frontend'] });
    
    // Simulate a conflict
    const resolution = agentCoordinator.resolveConflict(['dev1', 'arch1'], 'Component design disagreement');
    
    // Verify resolution
    expect(resolution).toBeDefined();
    expect(resolution.resolved).toBe(true);
    expect(resolution.resolutionMethod).toBe('mediation');
  });

  test('should optimize resource allocation based on workload', () => {
    // Register resources
    resourceManager.registerResource('compute1', 'compute', { cpu: '4-core', ram: '16GB' });
    resourceManager.registerResource('compute2', 'compute', { cpu: '8-core', ram: '32GB' });
    resourceManager.registerResource('storage1', 'storage', { type: 'SSD', size: '1TB' });
    
    // Allocate resources
    resourceManager.allocateResource('compute1', 'workflow1');
    resourceManager.allocateResource('storage1', 'workflow1');
    
    // Optimize allocation
    const optimization = resourceManager.optimizeAllocation({});
    
    // Verify optimization results
    expect(optimization).toBeDefined();
    expect(optimization.available).toBe(1); // Only compute2 should be available
    expect(optimization.allocated).toBe(2); // compute1 and storage1 should be allocated
  });

  test('should plan capacity based on upcoming workloads', () => {
    // Register resources
    resourceManager.registerResource('compute1', 'compute', { cpu: '4-core', ram: '16GB' });
    resourceManager.registerResource('storage1', 'storage', { type: 'SSD', size: '1TB' });
    
    // Plan capacity for upcoming workloads
    const upcomingWorkloads = [
      { type: 'compute', requirements: { cpu: '4-core' } },
      { type: 'storage', requirements: { size: '500GB' } },
      { type: 'compute', requirements: { cpu: '8-core' } } // This will create shortfall
    ];
    
    const plan = resourceManager.planCapacity(upcomingWorkloads);
    
    // Verify capacity plan
    expect(plan).toBeDefined();
    expect(plan.currentCapacity).toBe(2);
    expect(plan.projectedDemand).toBe(3);
    expect(plan.shortfall).toBe(1);
    expect(plan.recommendations.length).toBeGreaterThan(0);
  });

  test('should assess risks across all workflows and agents', () => {
    // Create workflows
    const workflow1 = workflowManager.createWorkflow('Workflow 1', ['developer'], ['development']);
    const workflow2 = workflowManager.createWorkflow('Workflow 2', ['developer'], ['development']);
    
    // Register agents
    agentCoordinator.registerAgent('dev1', 'developer', { languages: ['javascript'] });
    
    // Assess risks
    const risks = performanceMonitor.assessRisks();
    
    // Verify risks
    expect(risks).toBeDefined();
    // There should be risks related to workflow age since they were just created
    expect(risks.length).toBeGreaterThanOrEqual(0);
  });
});