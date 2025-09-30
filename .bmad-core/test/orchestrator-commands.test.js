// BMAD™ Orchestrator - Command Tests
// Copyright © 2025 BMAD™. All rights reserved.

const { BMADOrchestrator, OrchestratorCommandProcessor } = require('../orchestrator/index');

// Mock store_memory function for testing
global.store_memory = jest.fn();

describe('BMADOrchestrator Commands', () => {
  let orchestrator;
  let commandProcessor;

  beforeEach(() => {
    orchestrator = new BMADOrchestrator();
    commandProcessor = new OrchestratorCommandProcessor();
    global.store_memory.mockClear();
  });

  test('should show help', () => {
    const result = orchestrator.help();
    expect(result).toContain('*help');
    expect(result).toContain('*status');
    expect(result).toContain('*agents');
  });

  test('should show status', () => {
    const result = orchestrator.status();
    expect(result).toBeDefined();
    expect(result.timestamp).toBeDefined();
    expect(result.summary).toBeDefined();
  });

  test('should list agents', () => {
    // Register an agent first
    orchestrator.agentCoordinator.registerAgent('agent1', 'developer', { languages: ['javascript'] });
    
    const result = orchestrator.agents();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('agent1');
  });

  test('should list workflows', () => {
    // Create a workflow first
    orchestrator.workflowManager.createWorkflow('Test Workflow', ['agent1'], ['phase1']);
    
    const result = orchestrator.workflows();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Test Workflow');
  });

  test('should delegate task to agent', () => {
    // Register an available agent
    orchestrator.agentCoordinator.registerAgent('agent1', 'developer', { languages: ['javascript'] });
    
    const result = orchestrator.delegate('Implement feature', 'developer', 'Frontend task');
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.agentId).toBe('agent1');
  });

  test('should coordinate agents', () => {
    const result = orchestrator.coordinate(['agent1', 'agent2'], 'Implement feature', '2 days');
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.agents).toEqual(['agent1', 'agent2']);
  });

  test('should monitor performance', () => {
    const result = orchestrator.monitor('health', ['cpu', 'memory']);
    expect(result).toBeDefined();
    expect(result.scope).toBe('health');
    expect(result.metrics).toEqual(['cpu', 'memory']);
  });

  test('should optimize resources', () => {
    const result = orchestrator.optimize('resources', { maxUtilization: 80 });
    expect(result).toBeDefined();
    expect(result.target).toBe('resources');
    expect(result.constraints).toEqual({ maxUtilization: 80 });
  });

  test('should generate report', () => {
    const result = orchestrator.report('status', ['management'], 'weekly');
    expect(result).toBeDefined();
    expect(result.type).toBe('status');
    expect(result.audience).toEqual(['management']);
  });

  test('should escalate issue', () => {
    const result = orchestrator.escalate('Server down', 'Production server is not responding', 'high');
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.issueType).toBe('technical');
  });

  test('should create workflow', () => {
    const result = orchestrator.createWorkflow('New Workflow', ['developer', 'tester'], ['development', 'testing']);
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.message).toContain('created successfully');
  });

  test('should modify workflow', () => {
    // Create a workflow first
    const workflowResult = orchestrator.createWorkflow('Test Workflow', ['developer'], ['development']);
    const workflowId = workflowResult.workflowId;
    
    const result = orchestrator.modifyWorkflow(workflowId, { name: 'Modified Workflow' });
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.changes).toEqual({ name: 'Modified Workflow' });
  });

  test('should pause and resume workflow', () => {
    // Create a workflow first
    const workflowResult = orchestrator.createWorkflow('Test Workflow', ['developer'], ['development']);
    const workflowId = workflowResult.workflowId;
    
    // Pause workflow
    const pauseResult = orchestrator.pauseWorkflow(workflowId, 'Testing pause');
    expect(pauseResult).toBeDefined();
    expect(pauseResult.success).toBe(true);
    expect(pauseResult.reason).toBe('Testing pause');
    
    // Resume workflow
    const resumeResult = orchestrator.resumeWorkflow(workflowId, { name: 'Resumed Workflow' });
    expect(resumeResult).toBeDefined();
    expect(resumeResult.success).toBe(true);
    expect(resumeResult.adjustments).toEqual({ name: 'Resumed Workflow' });
  });

  test('should archive workflow', () => {
    // Create a workflow first
    const workflowResult = orchestrator.createWorkflow('Test Workflow', ['developer'], ['development']);
    const workflowId = workflowResult.workflowId;
    
    const result = orchestrator.archiveWorkflow(workflowId, 'Lesson learned');
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.lessonsLearned).toBe('Lesson learned');
  });

  test('should clone workflow', () => {
    // Create a workflow first
    const workflowResult = orchestrator.createWorkflow('Source Workflow', ['developer'], ['development']);
    const sourceId = workflowResult.workflowId;
    
    const result = orchestrator.cloneWorkflow(sourceId, { name: 'Cloned Workflow' });
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.sourceId).toBe(sourceId);
    expect(result.modifications).toEqual({ name: 'Cloned Workflow' });
  });

  test('should sync agents', () => {
    const result = orchestrator.syncAgents(['agent1', 'agent2'], 'Project update', 'meeting');
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.agents).toEqual(['agent1', 'agent2']);
  });

  test('should balance load', () => {
    const result = orchestrator.balanceLoad(['agent1', 'agent2'], 'even');
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.agents).toEqual(['agent1', 'agent2']);
  });

  test('should handoff task', () => {
    const context = { taskId: 'task1', description: 'Implement feature' };
    const result = orchestrator.handoff('agent1', 'agent2', context);
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.fromAgent).toBe('agent1');
    expect(result.toAgent).toBe('agent2');
  });

  test('should resolve conflict', () => {
    const result = orchestrator.conflictResolution(['agent1', 'agent2'], 'Design disagreement');
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.agents).toEqual(['agent1', 'agent2']);
  });

  test('should coordinate cross-training', () => {
    const result = orchestrator.crossTraining(['agent1', 'agent2'], ['javascript', 'python']);
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.agents).toEqual(['agent1', 'agent2']);
  });

  test('should assign backup agent', () => {
    const result = orchestrator.backupAssignment('agent1', 'agent2');
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.primaryAgent).toBe('agent1');
    expect(result.backupAgent).toBe('agent2');
  });
});

describe('OrchestratorCommandProcessor', () => {
  let commandProcessor;

  beforeEach(() => {
    commandProcessor = new OrchestratorCommandProcessor();
    global.store_memory.mockClear();
  });

  test('should process help command', () => {
    const result = commandProcessor.processCommand('*help');
    expect(result).toBeDefined();
    expect(result.type).toBe('output');
    expect(result.content).toContain('*help');
  });

  test('should process status command', () => {
    const result = commandProcessor.processCommand('*status');
    expect(result).toBeDefined();
    expect(result.type).toBe('data');
    expect(result.content).toBeDefined();
  });

  test('should process agents command', () => {
    const result = commandProcessor.processCommand('*agents');
    expect(result).toBeDefined();
    expect(result.type).toBe('data');
    expect(Array.isArray(result.content)).toBe(true);
  });

  test('should process workflows command', () => {
    const result = commandProcessor.processCommand('*workflows');
    expect(result).toBeDefined();
    expect(result.type).toBe('data');
    expect(Array.isArray(result.content)).toBe(true);
  });

  test('should process delegate command', () => {
    // Register an available agent first
    commandProcessor.orchestrator.agentCoordinator.registerAgent('agent1', 'developer', { languages: ['javascript'] });
    
    const result = commandProcessor.processCommand('*delegate "Implement feature" developer "Frontend task"');
    expect(result).toBeDefined();
    expect(result.type).toBe('data');
    expect(result.content.success).toBe(true);
  });

  test('should process coordinate command', () => {
    const result = commandProcessor.processCommand('*coordinate agent1,agent2 "Implement feature" "2 days"');
    expect(result).toBeDefined();
    expect(result.type).toBe('data');
    expect(result.content.success).toBe(true);
  });

  test('should process monitor command', () => {
    const result = commandProcessor.processCommand('*monitor health cpu,memory');
    expect(result).toBeDefined();
    expect(result.type).toBe('data');
    expect(result.content.scope).toBe('health');
  });

  test('should process optimize command', () => {
    const result = commandProcessor.processCommand('*optimize resources {"maxUtilization":80}');
    expect(result).toBeDefined();
    expect(result.type).toBe('data');
    expect(result.content.target).toBe('resources');
  });

  test('should process report command', () => {
    const result = commandProcessor.processCommand('*report status management,team weekly');
    expect(result).toBeDefined();
    expect(result.type).toBe('data');
    expect(result.content.type).toBe('status');
  });

  test('should process escalate command', () => {
    const result = commandProcessor.processCommand('*escalate "Server down" "Production server is not responding" high');
    expect(result).toBeDefined();
    expect(result.type).toBe('data');
    expect(result.content.success).toBe(true);
  });

  test('should process create-workflow command', () => {
    const result = commandProcessor.processCommand('*create-workflow "New Workflow" developer,tester development,testing');
    expect(result).toBeDefined();
    expect(result.type).toBe('data');
    expect(result.content.success).toBe(true);
  });

  test('should process modify-workflow command', () => {
    // Create a workflow first
    const workflowResult = commandProcessor.orchestrator.createWorkflow('Test Workflow', ['developer'], ['development']);
    const workflowId = workflowResult.workflowId;
    
    const result = commandProcessor.processCommand(`*modify-workflow ${workflowId} {"name":"Modified Workflow"}`);
    expect(result).toBeDefined();
    expect(result.type).toBe('data');
    expect(result.content.success).toBe(true);
  });

  test('should process pause-workflow command', () => {
    // Create a workflow first
    const workflowResult = commandProcessor.orchestrator.createWorkflow('Test Workflow', ['developer'], ['development']);
    const workflowId = workflowResult.workflowId;
    
    const result = commandProcessor.processCommand(`*pause-workflow ${workflowId} "Testing pause"`);
    expect(result).toBeDefined();
    expect(result.type).toBe('data');
    expect(result.content.success).toBe(true);
  });

  test('should process resume-workflow command', () => {
    // Create a workflow first
    const workflowResult = commandProcessor.orchestrator.createWorkflow('Test Workflow', ['developer'], ['development']);
    const workflowId = workflowResult.workflowId;
    
    // Pause the workflow first
    commandProcessor.orchestrator.pauseWorkflow(workflowId, 'Testing pause');
    
    const result = commandProcessor.processCommand(`*resume-workflow ${workflowId} {"name":"Resumed Workflow"}`);
    expect(result).toBeDefined();
    expect(result.type).toBe('data');
    expect(result.content.success).toBe(true);
  });

  test('should process archive-workflow command', () => {
    // Create a workflow first
    const workflowResult = commandProcessor.orchestrator.createWorkflow('Test Workflow', ['developer'], ['development']);
    const workflowId = workflowResult.workflowId;
    
    const result = commandProcessor.processCommand(`*archive-workflow ${workflowId} "Lesson learned"`);
    expect(result).toBeDefined();
    expect(result.type).toBe('data');
    expect(result.content.success).toBe(true);
  });

  test('should process clone-workflow command', () => {
    // Create a workflow first
    const workflowResult = commandProcessor.orchestrator.createWorkflow('Source Workflow', ['developer'], ['development']);
    const sourceId = workflowResult.workflowId;
    
    const result = commandProcessor.processCommand(`*clone-workflow ${sourceId} {"name":"Cloned Workflow"}`);
    expect(result).toBeDefined();
    expect(result.type).toBe('data');
    expect(result.content.success).toBe(true);
  });

  test('should process sync-agents command', () => {
    const result = commandProcessor.processCommand('*sync-agents agent1,agent2 "Project update" meeting');
    expect(result).toBeDefined();
    expect(result.type).toBe('data');
    expect(result.content.success).toBe(true);
  });

  test('should process balance-load command', () => {
    const result = commandProcessor.processCommand('*balance-load agent1,agent2 even');
    expect(result).toBeDefined();
    expect(result.type).toBe('data');
    expect(result.content.success).toBe(true);
  });

  test('should process handoff command', () => {
    const context = JSON.stringify({ taskId: 'task1', description: 'Implement feature' });
    const result = commandProcessor.processCommand(`*handoff agent1 agent2 '${context}'`);
    expect(result).toBeDefined();
    expect(result.type).toBe('data');
    expect(result.content.success).toBe(true);
  });

  test('should process conflict-resolution command', () => {
    const result = commandProcessor.processCommand('*conflict-resolution agent1,agent2 "Design disagreement"');
    expect(result).toBeDefined();
    expect(result.type).toBe('data');
    expect(result.content.success).toBe(true);
  });

  test('should process cross-training command', () => {
    const result = commandProcessor.processCommand('*cross-training agent1,agent2 javascript,python');
    expect(result).toBeDefined();
    expect(result.type).toBe('data');
    expect(result.content.success).toBe(true);
  });

  test('should process backup-assignment command', () => {
    const result = commandProcessor.processCommand('*backup-assignment agent1 agent2');
    expect(result).toBeDefined();
    expect(result.type).toBe('data');
    expect(result.content.success).toBe(true);
  });

  test('should handle unknown command', () => {
    expect(() => {
      commandProcessor.processCommand('*unknown-command');
    }).toThrow('Unknown command: unknown-command');
  });

  test('should handle missing arguments', () => {
    expect(() => {
      commandProcessor.processCommand('*delegate');
    }).toThrow('Delegate command requires task, agent-type, and context');
  });
});