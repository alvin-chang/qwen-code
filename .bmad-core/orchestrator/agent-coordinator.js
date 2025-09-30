// BMAD™ Orchestrator - Agent Coordinator
// Copyright © 2025 BMAD™. All rights reserved.

const WorkflowMonitor = require('../utils/workflow-monitor');

// Global store_memory function (to be implemented by the environment)
// eslint-disable-next-line no-undef
const store_memory = typeof global.store_memory !== 'undefined' ? global.store_memory : console.log;

class AgentCoordinator {
  constructor() {
    this.monitor = new WorkflowMonitor();
    this.agents = new Map();
  }

  /**
   * Register an agent with the coordinator
   * @param {string} agentId - Unique agent identifier
   * @param {string} agentType - Type of agent (e.g., 'developer', 'architect')
   * @param {Object} capabilities - Agent capabilities
   */
  registerAgent(agentId, agentType, capabilities) {
    const agent = {
      id: agentId,
      type: agentType,
      capabilities,
      status: 'available',
      currentWorkload: [],
      utilization: 0,
      registeredAt: new Date()
    };
    
    this.agents.set(agentId, agent);
    this.monitor.registerAgent(agent);
    
    // Store in memory with proper prefix
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:AGENT: Registered agent ${agentId} of type ${agentType}`
    });
  }

  /**
   * Update agent status
   * @param {string} agentId - Agent identifier
   * @param {string} status - New status
   */
  updateAgentStatus(agentId, status) {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }
    
    agent.status = status;
    agent.updatedAt = new Date();
    
    this.monitor.updateAgent(agentId, { status });
    
    // Store in memory with proper prefix
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:AGENT: Updated status for agent ${agentId} to ${status}`
    });
  }

  /**
   * Assign workload to agent
   * @param {string} agentId - Agent identifier
   * @param {Object} workload - Workload to assign
   */
  assignWorkload(agentId, workload) {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }
    
    agent.currentWorkload.push(workload);
    agent.utilization = this.calculateUtilization(agent);
    agent.updatedAt = new Date();
    
    this.monitor.updateAgent(agentId, {
      currentWorkload: agent.currentWorkload,
      utilization: agent.utilization
    });
    
    // Store in memory with proper prefix
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:AGENT: Assigned workload to agent ${agentId}`
    });
  }

  /**
   * Remove workload from agent
   * @param {string} agentId - Agent identifier
   * @param {string} workloadId - Workload identifier
   */
  removeWorkload(agentId, workloadId) {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }
    
    agent.currentWorkload = agent.currentWorkload.filter(w => w.id !== workloadId);
    agent.utilization = this.calculateUtilization(agent);
    agent.updatedAt = new Date();
    
    this.monitor.updateAgent(agentId, {
      currentWorkload: agent.currentWorkload,
      utilization: agent.utilization
    });
    
    // Store in memory with proper prefix
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:AGENT: Removed workload from agent ${agentId}`
    });
  }

  /**
   * Calculate agent utilization
   * @param {Object} agent - Agent object
   * @returns {number} Utilization percentage
   */
  calculateUtilization(agent) {
    // Simple calculation based on number of workloads
    // In a real implementation, this could be more complex
    return Math.min(100, agent.currentWorkload.length * 25);
  }

  /**
   * Balance workload across agents
   * @param {Array<string>} agentIds - Agent identifiers to balance
   * @param {string} criteria - Balancing criteria
   */
  balanceWorkload(agentIds, criteria) {
    // Get agents to balance
    const agentsToBalance = agentIds.map(id => this.agents.get(id)).filter(Boolean);
    
    // Simple redistribution algorithm
    // In a real implementation, this would be more sophisticated
    const totalWorkload = agentsToBalance.reduce((sum, agent) => sum + agent.currentWorkload.length, 0);
    const targetWorkload = Math.floor(totalWorkload / agentsToBalance.length);
    
    // Redistribute workloads
    const allWorkloads = agentsToBalance.flatMap(agent => agent.currentWorkload);
    agentsToBalance.forEach(agent => {
      agent.currentWorkload = [];
    });
    
    // Distribute workloads evenly
    allWorkloads.forEach((workload, index) => {
      const agentIndex = index % agentsToBalance.length;
      agentsToBalance[agentIndex].currentWorkload.push(workload);
    });
    
    // Update utilization and monitoring
    agentsToBalance.forEach(agent => {
      agent.utilization = this.calculateUtilization(agent);
      agent.updatedAt = new Date();
      this.monitor.updateAgent(agent.id, {
        currentWorkload: agent.currentWorkload,
        utilization: agent.utilization
      });
    });
    
    // Store in memory with proper prefix
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:AGENT: Balanced workload for agents ${agentIds.join(', ')}`
    });
  }

  /**
   * Coordinate handoff between agents
   * @param {string} fromAgentId - Source agent identifier
   * @param {string} toAgentId - Target agent identifier
   * @param {Object} context - Context to transfer
   */
  coordinateHandoff(fromAgentId, toAgentId, context) {
    const fromAgent = this.agents.get(fromAgentId);
    const toAgent = this.agents.get(toAgentId);
    
    if (!fromAgent || !toAgent) {
      throw new Error('One or both agents not found');
    }
    
    // Transfer context
    toAgent.currentWorkload.push(context);
    toAgent.utilization = this.calculateUtilization(toAgent);
    
    // Remove context from source agent
    const contextIndex = fromAgent.currentWorkload.findIndex(w => w.id === context.id);
    if (contextIndex !== -1) {
      fromAgent.currentWorkload.splice(contextIndex, 1);
    }
    fromAgent.utilization = this.calculateUtilization(fromAgent);
    
    // Update timestamps
    const now = new Date();
    fromAgent.updatedAt = now;
    toAgent.updatedAt = now;
    
    // Update monitoring
    this.monitor.updateAgent(fromAgentId, {
      currentWorkload: fromAgent.currentWorkload,
      utilization: fromAgent.utilization
    });
    
    this.monitor.updateAgent(toAgentId, {
      currentWorkload: toAgent.currentWorkload,
      utilization: toAgent.utilization
    });
    
    // Store in memory with proper prefix
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:AGENT: Handoff coordinated from ${fromAgentId} to ${toAgentId}`
    });
  }

  /**
   * Resolve conflict between agents
   * @param {Array<string>} agentIds - Agent identifiers in conflict
   * @param {string} issue - Description of the conflict
   * @returns {Object} Resolution result
   */
  resolveConflict(agentIds, issue) {
    // Simple conflict resolution - in a real implementation, this would be more sophisticated
    const resolution = {
      resolved: true,
      resolutionMethod: 'mediation',
      timestamp: new Date(),
      notes: `Conflict between agents ${agentIds.join(', ')} resolved through mediation`
    };
    
    // Store in memory with proper prefix
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:AGENT: Conflict resolved between agents ${agentIds.join(', ')} - ${issue}`
    });
    
    return resolution;
  }

  /**
   * Get all agents
   * @returns {Array} List of all agents
   */
  getAllAgents() {
    return Array.from(this.agents.values());
  }
}

module.exports = AgentCoordinator;