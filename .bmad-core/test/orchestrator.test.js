// BMAD™ Orchestrator - Unit Tests
// Copyright © 2025 BMAD™. All rights reserved.

const WorkflowManager = require('../orchestrator/workflow-manager');
const AgentCoordinator = require('../orchestrator/agent-coordinator');
const PerformanceMonitor = require('../orchestrator/performance-monitor');
const ResourceManager = require('../orchestrator/resource-manager');
const EscalationManager = require('../orchestrator/escalation-manager');

// Mock store_memory function for testing
global.store_memory = jest.fn();

describe('WorkflowManager', () => {
  let workflowManager;

  beforeEach(() => {
    workflowManager = new WorkflowManager();
    global.store_memory.mockClear();
  });

  test('should create a new workflow', () => {
    const workflowId = workflowManager.createWorkflow('Test Workflow', ['agent1', 'agent2'], ['phase1', 'phase2']);
    
    expect(workflowId).toBeDefined();
    expect(workflowManager.workflows.has(workflowId)).toBe(true);
    expect(store_memory).toHaveBeenCalledWith({
      agent_role: 'ORCHESTRATOR',
      project_id: 'default',
      content: expect.stringContaining('ORCH:WORKFLOW: Created workflow')
    });
  });

  test('should modify an existing workflow', () => {
    const workflowId = workflowManager.createWorkflow('Test Workflow', ['agent1'], ['phase1']);
    workflowManager.modifyWorkflow(workflowId, { name: 'Modified Workflow' });
    
    const workflow = workflowManager.workflows.get(workflowId);
    expect(workflow.name).toBe('Modified Workflow');
    expect(store_memory).toHaveBeenCalledWith({
      agent_role: 'ORCHESTRATOR',
      project_id: 'default',
      content: expect.stringContaining('ORCH:WORKFLOW: Modified workflow')
    });
  });

  test('should pause and resume a workflow', () => {
    const workflowId = workflowManager.createWorkflow('Test Workflow', ['agent1'], ['phase1']);
    
    // Pause workflow
    workflowManager.pauseWorkflow(workflowId, 'Testing pause');
    let workflow = workflowManager.workflows.get(workflowId);
    expect(workflow.status).toBe('paused');
    expect(workflow.pausedReason).toBe('Testing pause');
    
    // Resume workflow
    workflowManager.resumeWorkflow(workflowId, { name: 'Resumed Workflow' });
    workflow = workflowManager.workflows.get(workflowId);
    expect(workflow.status).toBe('active');
    expect(workflow.name).toBe('Resumed Workflow');
  });

  test('should archive a workflow', () => {
    const workflowId = workflowManager.createWorkflow('Test Workflow', ['agent1'], ['phase1']);
    workflowManager.archiveWorkflow(workflowId, 'Lesson learned');
    
    const workflow = workflowManager.workflows.get(workflowId);
    expect(workflow.status).toBe('archived');
    expect(workflow.lessonsLearned).toBe('Lesson learned');
  });

  test('should clone a workflow', () => {
    const sourceId = workflowManager.createWorkflow('Source Workflow', ['agent1'], ['phase1', 'phase2']);
    const clonedId = workflowManager.cloneWorkflow(sourceId, { name: 'Cloned Workflow' });
    
    expect(clonedId).toBeDefined();
    expect(clonedId).not.toBe(sourceId);
    
    const clonedWorkflow = workflowManager.workflows.get(clonedId);
    expect(clonedWorkflow.name).toBe('Cloned Workflow');
    expect(clonedWorkflow.phases.length).toBe(2);
  });

  test('should get workflow visualization', () => {
    const workflowId = workflowManager.createWorkflow('Test Workflow', ['agent1'], ['phase1']);
    const visualization = workflowManager.getWorkflowVisualization(workflowId);
    
    expect(visualization).toBeDefined();
    expect(typeof visualization).toBe('string');
  });

  test('should get all workflows', () => {
    workflowManager.createWorkflow('Workflow 1', ['agent1'], ['phase1']);
    workflowManager.createWorkflow('Workflow 2', ['agent2'], ['phase1']);
    
    const workflows = workflowManager.getAllWorkflows();
    expect(workflows.length).toBe(2);
  });
});

describe('AgentCoordinator', () => {
  let agentCoordinator;

  beforeEach(() => {
    agentCoordinator = new AgentCoordinator();
    global.store_memory.mockClear();
  });

  test('should register an agent', () => {
    agentCoordinator.registerAgent('agent1', 'developer', { languages: ['javascript'] });
    
    expect(agentCoordinator.agents.has('agent1')).toBe(true);
    expect(store_memory).toHaveBeenCalledWith({
      agent_role: 'ORCHESTRATOR',
      project_id: 'default',
      content: expect.stringContaining('ORCH:AGENT: Registered agent')
    });
  });

  test('should update agent status', () => {
    agentCoordinator.registerAgent('agent1', 'developer', { languages: ['javascript'] });
    agentCoordinator.updateAgentStatus('agent1', 'busy');
    
    const agent = agentCoordinator.agents.get('agent1');
    expect(agent.status).toBe('busy');
  });

  test('should assign and remove workload', () => {
    agentCoordinator.registerAgent('agent1', 'developer', { languages: ['javascript'] });
    
    // Assign workload
    const workload = { id: 'task1', description: 'Test task' };
    agentCoordinator.assignWorkload('agent1', workload);
    
    let agent = agentCoordinator.agents.get('agent1');
    expect(agent.currentWorkload).toContain(workload);
    
    // Remove workload
    agentCoordinator.removeWorkload('agent1', 'task1');
    agent = agentCoordinator.agents.get('agent1');
    expect(agent.currentWorkload).not.toContain(workload);
  });

  test('should balance workload', () => {
    agentCoordinator.registerAgent('agent1', 'developer', { languages: ['javascript'] });
    agentCoordinator.registerAgent('agent2', 'developer', { languages: ['javascript'] });
    
    const workload1 = { id: 'task1', description: 'Test task 1' };
    const workload2 = { id: 'task2', description: 'Test task 2' };
    
    agentCoordinator.assignWorkload('agent1', workload1);
    agentCoordinator.assignWorkload('agent1', workload2);
    
    agentCoordinator.balanceWorkload(['agent1', 'agent2'], 'even');
    
    const agent1 = agentCoordinator.agents.get('agent1');
    const agent2 = agentCoordinator.agents.get('agent2');
    
    expect(agent1.currentWorkload.length).toBe(1);
    expect(agent2.currentWorkload.length).toBe(1);
  });

  test('should coordinate handoff', () => {
    agentCoordinator.registerAgent('agent1', 'developer', { languages: ['javascript'] });
    agentCoordinator.registerAgent('agent2', 'developer', { languages: ['javascript'] });
    
    const workload = { id: 'task1', description: 'Test task' };
    agentCoordinator.assignWorkload('agent1', workload);
    
    agentCoordinator.coordinateHandoff('agent1', 'agent2', workload);
    
    const fromAgent = agentCoordinator.agents.get('agent1');
    const toAgent = agentCoordinator.agents.get('agent2');
    
    expect(fromAgent.currentWorkload).not.toContain(workload);
    expect(toAgent.currentWorkload).toContain(workload);
  });

  test('should resolve conflict', () => {
    agentCoordinator.registerAgent('agent1', 'developer', { languages: ['javascript'] });
    agentCoordinator.registerAgent('agent2', 'architect', { domains: ['backend'] });
    
    const resolution = agentCoordinator.resolveConflict(['agent1', 'agent2'], 'Design disagreement');
    
    expect(resolution.resolved).toBe(true);
    expect(resolution.resolutionMethod).toBe('mediation');
  });

  test('should get all agents', () => {
    agentCoordinator.registerAgent('agent1', 'developer', { languages: ['javascript'] });
    agentCoordinator.registerAgent('agent2', 'architect', { domains: ['backend'] });
    
    const agents = agentCoordinator.getAllAgents();
    expect(agents.length).toBe(2);
  });
});

describe('PerformanceMonitor', () => {
  let performanceMonitor;

  beforeEach(() => {
    performanceMonitor = new PerformanceMonitor();
    global.store_memory.mockClear();
  });

  test('should get workflow metrics', () => {
    const metrics = performanceMonitor.getWorkflowMetrics();
    expect(metrics).toBeDefined();
  });

  test('should detect bottlenecks', () => {
    const bottlenecks = performanceMonitor.detectBottlenecks();
    expect(bottlenecks).toBeDefined();
  });

  test('should predict delivery', () => {
    // This test would require setting up a workflow in the monitor
    // For now, we'll just verify it doesn't throw an error with invalid ID
    expect(() => {
      performanceMonitor.predictDelivery('invalid-id');
    }).toThrow();
  });

  test('should perform health check', () => {
    const healthCheck = performanceMonitor.performHealthCheck();
    expect(healthCheck).toBeDefined();
    expect(healthCheck.systemHealth).toBe('operational');
  });

  test('should assess risks', () => {
    const risks = performanceMonitor.assessRisks();
    expect(risks).toBeDefined();
  });
});

describe('ResourceManager', () => {
  let resourceManager;

  beforeEach(() => {
    resourceManager = new ResourceManager();
    global.store_memory.mockClear();
  });

  test('should register a resource', () => {
    resourceManager.registerResource('resource1', 'compute', { cpu: '4-core', ram: '16GB' });
    
    expect(resourceManager.resources.has('resource1')).toBe(true);
    expect(store_memory).toHaveBeenCalledWith({
      agent_role: 'ORCHESTRATOR',
      project_id: 'default',
      content: expect.stringContaining('ORCH:RESOURCE: Registered resource')
    });
  });

  test('should allocate and release resource', () => {
    resourceManager.registerResource('resource1', 'compute', { cpu: '4-core', ram: '16GB' });
    
    // Allocate resource
    const allocated = resourceManager.allocateResource('resource1', 'workflow1');
    expect(allocated).toBe(true);
    
    let resource = resourceManager.resources.get('resource1');
    expect(resource.status).toBe('allocated');
    expect(resource.allocatedTo).toBe('workflow1');
    
    // Release resource
    const released = resourceManager.releaseResource('resource1');
    expect(released).toBe(true);
    
    resource = resourceManager.resources.get('resource1');
    expect(resource.status).toBe('available');
    expect(resource.allocatedTo).toBeNull();
  });

  test('should optimize allocation', () => {
    resourceManager.registerResource('resource1', 'compute', { cpu: '4-core', ram: '16GB' });
    resourceManager.registerResource('resource2', 'storage', { type: 'SSD', size: '1TB' });
    
    const optimization = resourceManager.optimizeAllocation({});
    expect(optimization).toBeDefined();
    expect(optimization.available).toBe(2);
  });

  test('should plan capacity', () => {
    resourceManager.registerResource('resource1', 'compute', { cpu: '4-core', ram: '16GB' });
    
    const plan = resourceManager.planCapacity([{ type: 'compute' }, { type: 'storage' }]);
    expect(plan).toBeDefined();
    expect(plan.currentCapacity).toBe(1);
    expect(plan.projectedDemand).toBe(2);
    expect(plan.shortfall).toBe(1);
  });

  test('should get all resources', () => {
    resourceManager.registerResource('resource1', 'compute', { cpu: '4-core', ram: '16GB' });
    resourceManager.registerResource('resource2', 'storage', { type: 'SSD', size: '1TB' });
    
    const resources = resourceManager.getAllResources();
    expect(resources.length).toBe(2);
  });

  test('should get allocations for entity', () => {
    resourceManager.registerResource('resource1', 'compute', { cpu: '4-core', ram: '16GB' });
    resourceManager.registerResource('resource2', 'storage', { type: 'SSD', size: '1TB' });
    
    resourceManager.allocateResource('resource1', 'workflow1');
    resourceManager.allocateResource('resource2', 'workflow1');
    
    const allocations = resourceManager.getAllocations('workflow1');
    expect(allocations.length).toBe(2);
    expect(allocations).toContain('resource1');
    expect(allocations).toContain('resource2');
  });
});

describe('EscalationManager', () => {
  let escalationManager;

  beforeEach(() => {
    escalationManager = new EscalationManager();
    global.store_memory.mockClear();
  });

  test('should define escalation path', () => {
    escalationManager.defineEscalationPath('technical', ['developer', 'architect', 'cto']);
    
    expect(escalationManager.escalationPaths.has('technical')).toBe(true);
    expect(store_memory).toHaveBeenCalledWith({
      agent_role: 'ORCHESTRATOR',
      project_id: 'default',
      content: expect.stringContaining('ORCH:ESCALATION: Defined escalation path')
    });
  });

  test('should escalate issue', () => {
    escalationManager.defineEscalationPath('technical', ['developer', 'architect', 'cto']);
    const escalation = escalationManager.escalateIssue('Server down', 'technical', 'monitoring');
    
    expect(escalation).toBeDefined();
    expect(escalation.issue).toBe('Server down');
    expect(escalation.issueType).toBe('technical');
    expect(store_memory).toHaveBeenCalledWith({
      agent_role: 'ORCHESTRATOR',
      project_id: 'default',
      content: expect.stringContaining('ORCH:ESCALATION: Escalated issue')
    });
  });

  test('should resolve escalation', () => {
    escalationManager.defineEscalationPath('technical', ['developer', 'architect', 'cto']);
    const escalation = escalationManager.escalateIssue('Server down', 'technical', 'monitoring');
    
    escalationManager.resolveEscalation(escalation.id, 'Restarted server');
    
    const resolvedEscalation = escalationManager.activeEscalations.get(escalation.id);
    expect(resolvedEscalation.status).toBe('resolved');
    expect(resolvedEscalation.resolution).toBe('Restarted server');
  });

  test('should resolve conflict', () => {
    const resolution = escalationManager.resolveConflict(['agent1', 'agent2'], 'Design disagreement');
    
    expect(resolution.resolved).toBe(true);
    expect(resolution.resolutionMethod).toBe('mediation');
    expect(store_memory).toHaveBeenCalledWith({
      agent_role: 'ORCHESTRATOR',
      project_id: 'default',
      content: expect.stringContaining('ORCH:ESCALATION: Conflict resolved')
    });
  });

  test('should get active escalations', () => {
    escalationManager.defineEscalationPath('technical', ['developer', 'architect', 'cto']);
    escalationManager.escalateIssue('Server down', 'technical', 'monitoring');
    escalationManager.escalateIssue('Database error', 'technical', 'application');
    
    const escalations = escalationManager.getActiveEscalations();
    expect(escalations.length).toBe(2);
  });
});