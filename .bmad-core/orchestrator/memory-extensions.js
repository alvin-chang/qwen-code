// BMAD™ Orchestrator - Memory Extensions
// Copyright © 2025 BMAD™. All rights reserved.

const fs = require('fs-extra');
const path = require('path');

/**
 * Extend EnhancedMemorySystem with orchestrator-specific capabilities
 */
class OrchestratorMemoryExtensions {
  /**
   * Broadcast message to multiple agents
   * @param {EnhancedMemorySystem} memorySystem - The memory system instance
   * @param {string} message - Message to broadcast
   * @param {Array|string} toAgents - Agents to broadcast to
   * @param {Object} options - Broadcast options
   * @returns {Object} Broadcast result
   */
  static async broadcastMessage(memorySystem, message, toAgents, options = {}) {
    try {
      // Create broadcast record
      const broadcastRecord = {
        id: memorySystem.generateId(),
        message,
        from_agent: options.from_agent || 'orchestrator',
        to_agents: Array.isArray(toAgents) ? toAgents : [toAgents],
        timestamp: new Date().toISOString(),
        priority: options.priority || 'normal',
        requires_ack: options.requires_ack || false,
        ack_received: []
      };
      
      // Store in shared communications area
      const commsDir = path.join(memorySystem.storagePath, 'communications');
      await fs.ensureDir(commsDir);
      const commsPath = path.join(commsDir, `${broadcastRecord.id}.${memorySystem.format}`);
      await fs.writeJson(commsPath, broadcastRecord, { spaces: 2 });
      
      return broadcastRecord;
    } catch (error) {
      throw new Error(`Failed to broadcast message: ${error.message}`);
    }
  }

  /**
   * Listen for messages directed to specific agent
   * @param {EnhancedMemorySystem} memorySystem - The memory system instance
   * @param {string} agentRole - Agent role to listen for
   * @param {Function} callback - Function to call when message received
   */
  static async listenForMessages(memorySystem, agentRole, callback) {
    try {
      const commsDir = path.join(memorySystem.storagePath, 'communications');
      if (!(await fs.pathExists(commsDir))) return;
      
      const files = await fs.readdir(commsDir);
      for (const file of files) {
        if (file.endsWith(`.${memorySystem.format}`)) {
          try {
            const filePath = path.join(commsDir, file);
            const message = await fs.readJson(filePath);
            
            // Check if message is for this agent and not yet processed
            if (message.to_agents.includes(agentRole) && 
                !message.processed_by?.includes(agentRole)) {
              // Mark as processed
              if (!message.processed_by) message.processed_by = [];
              message.processed_by.push(agentRole);
              message.last_processed = new Date().toISOString();
              await fs.writeJson(filePath, message, { spaces: 2 });
              
              // Call callback
              await callback(message);
            }
          } catch (fileError) {
            continue;
          }
        }
      }
    } catch (error) {
      throw new Error(`Failed to listen for messages: ${error.message}`);
    }
  }

  /**
   * Store workflow state
   * @param {EnhancedMemorySystem} memorySystem - The memory system instance
   * @param {string} workflowId - Workflow ID
   * @param {Object} state - Workflow state
   * @param {Object} options - Storage options
   * @returns {Object} Stored workflow state
   */
  static async storeWorkflowState(memorySystem, workflowId, state, options = {}) {
    try {
      const workflowState = {
        id: workflowId,
        state,
        timestamp: new Date().toISOString(),
        updated_by: options.updated_by || 'unknown',
        agents_involved: options.agents_involved || [],
        status: options.status || 'active',
        progress: options.progress || 0
      };
      
      const workflowDir = path.join(memorySystem.storagePath, 'workflows');
      await fs.ensureDir(workflowDir);
      const workflowPath = path.join(workflowDir, `${workflowId}.${memorySystem.format}`);
      await fs.writeJson(workflowPath, workflowState, { spaces: 2 });
      
      return workflowState;
    } catch (error) {
      throw new Error(`Failed to store workflow state: ${error.message}`);
    }
  }

  /**
   * Retrieve workflow state
   * @param {EnhancedMemorySystem} memorySystem - The memory system instance
   * @param {string} workflowId - Workflow ID
   * @returns {Object} Workflow state
   */
  static async retrieveWorkflowState(memorySystem, workflowId) {
    try {
      const workflowDir = path.join(memorySystem.storagePath, 'workflows');
      const workflowPath = path.join(workflowDir, `${workflowId}.${memorySystem.format}`);
      
      if (await fs.pathExists(workflowPath)) {
        return await fs.readJson(workflowPath);
      }
      
      return null;
    } catch (error) {
      throw new Error(`Failed to retrieve workflow state: ${error.message}`);
    }
  }
}

/**
 * Extend MemoryAnalytics with orchestrator-specific capabilities
 */
class OrchestratorAnalyticsExtensions {
  /**
   * Track orchestrator performance metrics
   * @param {MemoryAnalytics} analytics - The analytics instance
   * @param {Object} perfData - Performance data
   */
  static trackOrchestratorPerformance(analytics, perfData) {
    if (!analytics.analyticsData.orchestrator) {
      analytics.analyticsData.orchestrator = {
        workflows: {},
        agents: {},
        resource_utilization: {
          history: [],
          current: {}
        }
      };
    }
    
    // Track workflow metrics
    if (perfData.workflow) {
      const workflowId = perfData.workflow.id;
      if (!analytics.analyticsData.orchestrator.workflows[workflowId]) {
        analytics.analyticsData.orchestrator.workflows[workflowId] = {
          execution_time: [],
          completion_rate: 0,
          agent_coordination_count: 0
        };
      }
      
      const workflow = analytics.analyticsData.orchestrator.workflows[workflowId];
      if (perfData.workflow.execution_time) {
        workflow.execution_time.push({
          timestamp: new Date().toISOString(),
          duration: perfData.workflow.execution_time
        });
      }
      
      if (perfData.workflow.completed !== undefined) {
        workflow.completion_rate = perfData.workflow.completed ? 1 : 0;
      }
      
      if (perfData.workflow.agents_coordinated) {
        workflow.agent_coordination_count += perfData.workflow.agents_coordinated;
      }
    }
    
    // Track agent performance
    if (perfData.agent) {
      const agentRole = perfData.agent.role;
      if (!analytics.analyticsData.orchestrator.agents[agentRole]) {
        analytics.analyticsData.orchestrator.agents[agentRole] = {
          task_completion_time: [],
          workload_balance: 0,
          coordination_efficiency: 0
        };
      }
      
      const agent = analytics.analyticsData.orchestrator.agents[agentRole];
      if (perfData.agent.task_completion_time) {
        agent.task_completion_time.push({
          timestamp: new Date().toISOString(),
          duration: perfData.agent.task_completion_time
        });
      }
      
      if (perfData.agent.workload_balance !== undefined) {
        agent.workload_balance = perfData.agent.workload_balance;
      }
    }
    
    // Track resource utilization
    if (perfData.resource_utilization) {
      analytics.analyticsData.orchestrator.resource_utilization.history.push({
        timestamp: new Date().toISOString(),
        ...perfData.resource_utilization
      });
      analytics.analyticsData.orchestrator.resource_utilization.current = perfData.resource_utilization;
    }
  }

  /**
   * Generate orchestrator performance report
   * @param {MemoryAnalytics} analytics - The analytics instance
   * @param {Object} options - Report options
   * @returns {Object} Performance report
   */
  static generateOrchestratorReport(analytics, options = {}) {
    const report = {
      generated: new Date().toISOString(),
      period: options.period || 'all_time',
      metrics: {}
    };
    
    if (analytics.analyticsData.orchestrator) {
      // Workflow metrics
      const workflowData = Object.values(analytics.analyticsData.orchestrator.workflows);
      report.metrics.workflows = {
        total_tracked: workflowData.length,
        average_completion_time: workflowData.length > 0
          ? workflowData.reduce((sum, wf) => {
              const times = wf.execution_time.map(t => t.duration);
              return sum + (times.length > 0 
                ? times.reduce((a, b) => a + b, 0) / times.length 
                : 0);
            }, 0) / workflowData.length
          : 0,
        completion_rate: workflowData.length > 0
          ? workflowData.filter(wf => wf.completion_rate === 1).length / workflowData.length
          : 0
      };
      
      // Agent metrics
      const agentData = Object.values(analytics.analyticsData.orchestrator.agents);
      report.metrics.agents = {
        total_tracked: agentData.length,
        average_workload_balance: agentData.length > 0
          ? agentData.reduce((sum, agent) => sum + agent.workload_balance, 0) / agentData.length
          : 0
      };
      
      // Resource utilization
      if (analytics.analyticsData.orchestrator.resource_utilization.history.length > 0) {
        const latest = analytics.analyticsData.orchestrator.resource_utilization.current;
        report.metrics.resource_utilization = {
          current: latest,
          peak_usage: analytics.getPeakUsage(analytics.analyticsData.orchestrator.resource_utilization.history)
        };
      }
    }
    
    return report;
  }
}

module.exports = {
  OrchestratorMemoryExtensions,
  OrchestratorAnalyticsExtensions
};