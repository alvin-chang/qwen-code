// Workflow monitoring utility for BMAD orchestrator
class WorkflowMonitor {
  constructor() {
    this.workflows = new Map();
    this.agents = new Map();
    this.metrics = {
      workflowCount: 0,
      activeWorkflows: 0,
      completedWorkflows: 0,
      failedWorkflows: 0,
      agentUtilization: {}
    };
  }
  
  /**
   * Register a new workflow
   * @param {Object} workflow - Workflow object
   */
  registerWorkflow(workflow) {
    this.workflows.set(workflow.id, {
      ...workflow,
      status: 'pending',
      startTime: new Date(),
      phases: workflow.phases ? workflow.phases.map(phase => ({
        ...phase,
        status: 'pending',
        startTime: null,
        endTime: null
      })) : [],
      alerts: []
    });
    
    this.metrics.workflowCount++;
    this.metrics.activeWorkflows++;
  }
  
  /**
   * Update workflow status
   * @param {string} workflowId - Workflow identifier
   * @param {string} status - New status
   * @param {Object} details - Additional details
   */
  updateWorkflowStatus(workflowId, status, details = {}) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return;
    
    const previousStatus = workflow.status;
    workflow.status = status;
    
    // Update metrics based on status changes
    if (previousStatus === 'active' && status === 'completed') {
      this.metrics.activeWorkflows--;
      this.metrics.completedWorkflows++;
    } else if (previousStatus === 'active' && status === 'failed') {
      this.metrics.activeWorkflows--;
      this.metrics.failedWorkflows++;
    }
    
    // Add details to workflow
    Object.assign(workflow, details);
    
    // Add timestamp for completion/ failure
    if (status === 'completed' || status === 'failed') {
      workflow.endTime = new Date();
    }
  }

  /**
   * Update workflow with changes
   * @param {string} workflowId - Workflow identifier
   * @param {Object} changes - Changes to apply
   */
  updateWorkflow(workflowId, changes) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return;
    
    // Apply changes to workflow
    Object.assign(workflow, changes);
    
    // Update metrics if status changed
    if (changes.status) {
      const previousStatus = workflow.status;
      const newStatus = changes.status;
      
      // Update metrics based on status changes
      if (previousStatus === 'active' && newStatus === 'completed') {
        this.metrics.activeWorkflows--;
        this.metrics.completedWorkflows++;
      } else if (previousStatus === 'active' && newStatus === 'failed') {
        this.metrics.activeWorkflows--;
        this.metrics.failedWorkflows++;
      } else if (previousStatus === 'pending' && newStatus === 'active') {
        this.metrics.activeWorkflows++;
      }
      
      workflow.status = newStatus;
    }
    
    // Add timestamp for completion/ failure
    if (changes.status === 'completed' || changes.status === 'failed') {
      workflow.endTime = new Date();
    } else if (changes.status === 'active' && !workflow.startTime) {
      workflow.startTime = new Date();
    }
  }
  
  /**
   * Update phase status within a workflow
   * @param {string} workflowId - Workflow identifier
   * @param {string} phaseName - Phase name
   * @param {string} status - New status
   * @param {Object} details - Additional details
   */
  updatePhaseStatus(workflowId, phaseName, status, details = {}) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return;
    
    const phase = workflow.phases.find(p => p.name === phaseName);
    if (!phase) return;
    
    const previousStatus = phase.status;
    phase.status = status;
    
    // Add timestamps
    if (status === 'active' && !phase.startTime) {
      phase.startTime = new Date();
    } else if ((status === 'completed' || status === 'failed') && !phase.endTime) {
      phase.endTime = new Date();
    }
    
    // Add details to phase
    Object.assign(phase, details);
  }
  
  /**
   * Add an alert to a workflow
   * @param {string} workflowId - Workflow identifier
   * @param {Object} alert - Alert object
   */
  addAlert(workflowId, alert) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return;
    
    workflow.alerts.push({
      ...alert,
      timestamp: new Date()
    });
  }
  
  /**
   * Register an agent
   * @param {Object} agent - Agent object
   */
  registerAgent(agent) {
    this.agents.set(agent.id, {
      id: agent.id,
      ...agent,
      status: 'idle',
      currentWorkflow: null,
      currentTask: null,
      lastActive: new Date(),
      utilization: 0
    });
    
    // Initialize agent utilization metric
    this.metrics.agentUtilization[agent.id] = 0;
  }
  
  /**
   * Update agent status
   * @param {string} agentId - Agent identifier
   * @param {string} status - New status
   * @param {Object} details - Additional details
   */
  updateAgentStatus(agentId, status, details = {}) {
    const agent = this.agents.get(agentId);
    if (!agent) return;
    
    const previousStatus = agent.status;
    agent.status = status;
    
    // Update utilization if agent became busy
    if (previousStatus === 'idle' && status === 'busy') {
      agent.lastActive = new Date();
    }
    
    // Add details to agent
    Object.assign(agent, details);
    
    // Update metrics
    this.updateAgentUtilization(agentId);
  }

  /**
   * Update agent with changes
   * @param {string} agentId - Agent identifier
   * @param {Object} changes - Changes to apply
   */
  updateAgent(agentId, changes) {
    const agent = this.agents.get(agentId);
    if (!agent) return;
    
    // Apply changes to agent
    Object.assign(agent, changes);
    
    // Update metrics if status changed
    if (changes.status) {
      const previousStatus = agent.status;
      const newStatus = changes.status;
      
      // Update utilization if agent became busy
      if (previousStatus === 'idle' && newStatus === 'busy') {
        agent.lastActive = new Date();
      }
      
      agent.status = newStatus;
    }
    
    // Update metrics
    this.updateAgentUtilization(agentId);
  }
  
  /**
   * Update agent utilization metric
   * @param {string} agentId - Agent identifier
   */
  updateAgentUtilization(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) return;
    
    // Simple utilization calculation based on time busy
    const now = new Date();
    const timeSinceLastActive = now - agent.lastActive;
    
    // If agent has been busy for more than 5 minutes, increase utilization
    if (agent.status === 'busy' && timeSinceLastActive > 5 * 60 * 1000) {
      agent.utilization = Math.min(100, agent.utilization + 1);
      this.metrics.agentUtilization[agentId] = agent.utilization;
    }
  }
  
  /**
   * Get workflow by ID
   * @param {string} workflowId - Workflow identifier
   * @returns {Object} Workflow object
   */
  getWorkflow(workflowId) {
    return this.workflows.get(workflowId);
  }
  
  /**
   * Get all workflows
   * @returns {Array} Array of workflow objects
   */
  getAllWorkflows() {
    return Array.from(this.workflows.values());
  }
  
  /**
   * Get agent by ID
   * @param {string} agentId - Agent identifier
   * @returns {Object} Agent object
   */
  getAgent(agentId) {
    return this.agents.get(agentId);
  }
  
  /**
   * Get all agents
   * @returns {Array} Array of agent objects
   */
  getAllAgents() {
    return Array.from(this.agents.values());
  }
  
  /**
   * Get system metrics
   * @returns {Object} Metrics object
   */
  getMetrics() {
    return { ...this.metrics };
  }
  
  /**
   * Get alerts for a workflow
   * @param {string} workflowId - Workflow identifier
   * @returns {Array} Array of alerts
   */
  getAlerts(workflowId) {
    const workflow = this.workflows.get(workflowId);
    return workflow ? [...workflow.alerts] : [];
  }
  
  /**
   * Check for workflow bottlenecks
   * @param {string} workflowId - Workflow identifier
   * @returns {Array} Array of bottleneck alerts
   */
  checkForBottlenecks(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return [];
    
    const bottlenecks = [];
    
    // Check for long-running phases
    workflow.phases.forEach(phase => {
      if (phase.status === 'active' && phase.startTime) {
        const duration = (new Date() - new Date(phase.startTime)) / (1000 * 60); // minutes
        if (duration > 30) { // More than 30 minutes
          bottlenecks.push({
            type: 'long_running_phase',
            phase: phase.name,
            duration: Math.round(duration),
            message: `Phase "${phase.name}" has been active for ${Math.round(duration)} minutes`
          });
        }
      }
    });
    
    // Check for agent overutilization
    this.agents.forEach(agent => {
      if (agent.utilization > 80) {
        bottlenecks.push({
          type: 'agent_overutilization',
          agent: agent.name,
          utilization: agent.utilization,
          message: `Agent "${agent.name}" is overutilized (${agent.utilization}%)`
        });
      }
    });
    
    return bottlenecks;
  }
  
  /**
   * Detect bottlenecks across all workflows
   * @returns {Array} Array of all bottlenecks
   */
  detectBottlenecks() {
    const allBottlenecks = [];
    
    // Check bottlenecks for each workflow
    this.workflows.forEach((workflow, workflowId) => {
      const bottlenecks = this.checkForBottlenecks(workflowId);
      allBottlenecks.push(...bottlenecks);
    });
    
    return allBottlenecks;
  }
}

module.exports = WorkflowMonitor;