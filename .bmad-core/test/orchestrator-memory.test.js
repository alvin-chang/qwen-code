// BMAD™ Orchestrator - Memory Integration Tests
// Copyright © 2025 BMAD™. All rights reserved.

const { OrchestratorMemoryExtensions, OrchestratorAnalyticsExtensions } = require('../orchestrator/memory-extensions');
const fs = require('fs-extra');
const path = require('path');

// Mock store_memory function for testing
global.store_memory = jest.fn();

// Mock EnhancedMemorySystem and MemoryAnalytics for testing
const mockMemorySystem = {
  storagePath: path.join(__dirname, 'test-memory'),
  format: 'json',
  generateId: () => `id-${Date.now()}`
};

const mockAnalytics = {
  analyticsData: {},
  getPeakUsage: (history) => {
    if (history.length === 0) return {};
    return history.reduce((max, current) => 
      current.utilization > max.utilization ? current : max
    );
  }
};

describe('OrchestratorMemoryExtensions', () => {
  beforeEach(() => {
    global.store_memory.mockClear();
    // Create test directories
    fs.ensureDirSync(mockMemorySystem.storagePath);
    fs.ensureDirSync(path.join(mockMemorySystem.storagePath, 'communications'));
    fs.ensureDirSync(path.join(mockMemorySystem.storagePath, 'workflows'));
  });

  afterEach(() => {
    // Clean up test directories
    fs.removeSync(mockMemorySystem.storagePath);
  });

  test('should broadcast message to agents', async () => {
    const message = 'Test message';
    const toAgents = ['agent1', 'agent2'];
    const options = { from_agent: 'orchestrator', priority: 'high' };
    
    const result = await OrchestratorMemoryExtensions.broadcastMessage(
      mockMemorySystem, 
      message, 
      toAgents, 
      options
    );
    
    expect(result).toBeDefined();
    expect(result.message).toBe(message);
    expect(result.to_agents).toEqual(toAgents);
    expect(result.from_agent).toBe('orchestrator');
    expect(result.priority).toBe('high');
  });

  test('should listen for messages', async () => {
    // First broadcast a message
    const message = 'Test message';
    const toAgents = ['agent1'];
    await OrchestratorMemoryExtensions.broadcastMessage(
      mockMemorySystem, 
      message, 
      toAgents, 
      { from_agent: 'orchestrator' }
    );
    
    // Now listen for messages
    const receivedMessages = [];
    const callback = (message) => {
      receivedMessages.push(message);
    };
    
    await OrchestratorMemoryExtensions.listenForMessages(
      mockMemorySystem, 
      'agent1', 
      callback
    );
    
    expect(receivedMessages.length).toBe(1);
    expect(receivedMessages[0].message).toBe(message);
  });

  test('should store and retrieve workflow state', async () => {
    const workflowId = 'workflow-123';
    const state = { status: 'active', phase: 'development' };
    const options = { updated_by: 'test', agents_involved: ['agent1'] };
    
    // Store workflow state
    const storedState = await OrchestratorMemoryExtensions.storeWorkflowState(
      mockMemorySystem, 
      workflowId, 
      state, 
      options
    );
    
    expect(storedState).toBeDefined();
    expect(storedState.id).toBe(workflowId);
    expect(storedState.state).toEqual(state);
    expect(storedState.updated_by).toBe('test');
    
    // Retrieve workflow state
    const retrievedState = await OrchestratorMemoryExtensions.retrieveWorkflowState(
      mockMemorySystem, 
      workflowId
    );
    
    expect(retrievedState).toBeDefined();
    expect(retrievedState.id).toBe(workflowId);
    expect(retrievedState.state).toEqual(state);
  });

  test('should handle non-existent workflow state', async () => {
    const retrievedState = await OrchestratorMemoryExtensions.retrieveWorkflowState(
      mockMemorySystem, 
      'non-existent-workflow'
    );
    
    expect(retrievedState).toBeNull();
  });
});

describe('OrchestratorAnalyticsExtensions', () => {
  beforeEach(() => {
    global.store_memory.mockClear();
    mockAnalytics.analyticsData = {};
  });

  test('should track orchestrator performance metrics', () => {
    const perfData = {
      workflow: {
        id: 'workflow-123',
        execution_time: 1000,
        completed: true,
        agents_coordinated: 2
      },
      agent: {
        role: 'developer',
        task_completion_time: 500,
        workload_balance: 0.75
      },
      resource_utilization: {
        cpu: 0.6,
        memory: 0.4
      }
    };
    
    OrchestratorAnalyticsExtensions.trackOrchestratorPerformance(mockAnalytics, perfData);
    
    // Verify workflow metrics
    expect(mockAnalytics.analyticsData.orchestrator.workflows['workflow-123']).toBeDefined();
    expect(mockAnalytics.analyticsData.orchestrator.workflows['workflow-123'].execution_time.length).toBe(1);
    expect(mockAnalytics.analyticsData.orchestrator.workflows['workflow-123'].completion_rate).toBe(1);
    expect(mockAnalytics.analyticsData.orchestrator.workflows['workflow-123'].agent_coordination_count).toBe(2);
    
    // Verify agent metrics
    expect(mockAnalytics.analyticsData.orchestrator.agents.developer).toBeDefined();
    expect(mockAnalytics.analyticsData.orchestrator.agents.developer.task_completion_time.length).toBe(1);
    expect(mockAnalytics.analyticsData.orchestrator.agents.developer.workload_balance).toBe(0.75);
    
    // Verify resource utilization
    expect(mockAnalytics.analyticsData.orchestrator.resource_utilization.history.length).toBe(1);
    expect(mockAnalytics.analyticsData.orchestrator.resource_utilization.current).toEqual({
      cpu: 0.6,
      memory: 0.4
    });
  });

  test('should generate orchestrator report', () => {
    // Add some test data
    const perfData = {
      workflow: {
        id: 'workflow-123',
        execution_time: 1000,
        completed: true,
        agents_coordinated: 2
      },
      agent: {
        role: 'developer',
        task_completion_time: 500,
        workload_balance: 0.75
      },
      resource_utilization: {
        cpu: 0.6,
        memory: 0.4
      }
    };
    
    OrchestratorAnalyticsExtensions.trackOrchestratorPerformance(mockAnalytics, perfData);
    
    // Generate report
    const report = OrchestratorAnalyticsExtensions.generateOrchestratorReport(mockAnalytics, { period: 'weekly' });
    
    expect(report).toBeDefined();
    expect(report.generated).toBeDefined();
    expect(report.period).toBe('weekly');
    expect(report.metrics.workflows).toBeDefined();
    expect(report.metrics.agents).toBeDefined();
    expect(report.metrics.resource_utilization).toBeDefined();
  });

  test('should handle empty analytics data', () => {
    const report = OrchestratorAnalyticsExtensions.generateOrchestratorReport(mockAnalytics, { period: 'weekly' });
    
    expect(report).toBeDefined();
    expect(report.metrics.workflows.total_tracked).toBe(0);
    expect(report.metrics.agents.total_tracked).toBe(0);
  });
});