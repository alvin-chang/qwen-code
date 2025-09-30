// BMAD™ Orchestrator - Main Implementation
// Copyright © 2025 BMAD™. All rights reserved.

const WorkflowManager = require('./workflow-manager');
const AgentCoordinator = require('./agent-coordinator');
const PerformanceMonitor = require('./performance-monitor');
const ResourceManager = require('./resource-manager');
const EscalationManager = require('./escalation-manager');
const { OrchestratorMemoryExtensions, OrchestratorAnalyticsExtensions } = require('./memory-extensions');
const orchestratorConfig = require('./config');

// Global store_memory function (to be implemented by the environment)
// eslint-disable-next-line no-undef
const store_memory = typeof global.store_memory !== 'undefined' ? global.store_memory : console.log;

class BMADOrchestrator {
  constructor(config = orchestratorConfig) {
    this.config = config;
    this.workflowManager = new WorkflowManager();
    this.agentCoordinator = new AgentCoordinator();
    this.performanceMonitor = new PerformanceMonitor(this.workflowManager.monitor);
    this.resourceManager = new ResourceManager();
    this.escalationManager = new EscalationManager();
    
    // Initialize escalation paths from config
    if (this.config.agents && this.config.agents.coordination) {
      // Technical issues: developer -> architect -> CTO
      this.escalationManager.defineEscalationPath('technical', ['developer', 'architect', 'cto']);
      
      // Process issues: scrum master -> project manager -> product owner
      this.escalationManager.defineEscalationPath('process', ['sm', 'pm', 'po']);
      
      // Quality issues: QA -> architect -> CTO
      this.escalationManager.defineEscalationPath('quality', ['qa', 'architect', 'cto']);
      
      // Security issues: security analyst -> security manager -> CIO
      this.escalationManager.defineEscalationPath('security', ['security-analyst', 'security-manager', 'cio']);
    }
  }

  /**
   * Show all available orchestrator commands and workflows
   * @returns {string} Help text
   */
  help() {
    return `
# BMAD™ Orchestrator Commands

## Core Commands
1.  *help - Show all available orchestrator commands and workflows
2.  *status - Display current orchestration dashboard with all active workflows
3.  *agents - List all available agents, their status, and current assignments
4.  *workflows - Show active workflows, templates, and orchestration patterns
5.  *delegate [task] [agent-type] [context] - Intelligently delegate tasks to appropriate agents
6.  *coordinate [agents] [objective] [timeline] - Set up coordination between specific agents
7.  *monitor [scope] [metrics] - Monitor performance across agents or workflows
8.  *optimize [target] [constraints] - Optimize resource allocation or workflow efficiency
9.  *report [type] [audience] [timeframe] - Generate orchestration reports for stakeholders
10. *escalate [issue] [context] [urgency] - Escalate critical issues to appropriate stakeholders

## Workflow Management
11. *create-workflow [name] [agents] [phases] - Design new multi-agent workflow
12. *modify-workflow [workflow-id] [changes] - Adjust existing workflow parameters
13. *pause-workflow [workflow-id] [reason] - Temporarily halt workflow execution
14. *resume-workflow [workflow-id] [adjustments] - Restart paused workflows
15. *archive-workflow [workflow-id] [lessons-learned] - Archive completed workflows
16. *clone-workflow [source-id] [modifications] - Create workflow from existing template

## Agent Coordination
17. *sync-agents [agent-list] [topic] [format] - Coordinate synchronization between agents
18. *balance-load [agents] [criteria] - Rebalance workloads across agents
19. *handoff [from-agent] [to-agent] [context] - Manage clean handoffs between agents
20. *conflict-resolution [agents] [issue] - Facilitate resolution of agent conflicts
21. *cross-training [agents] [skills] - Coordinate knowledge sharing between agents
22. *backup-assignment [primary-agent] [backup-agent] - Set up agent backup arrangements

## Enhanced Orchestrator Commands
23. *visualize [workflow-id] - Generate real-time visualization of workflow status
24. *analyze-performance - Analyze workflow performance and identify bottlenecks
25. *predict-delivery [workflow-id] - Predict delivery dates based on current progress and trends
`;
  }

  /**
   * Display current orchestration dashboard with all active workflows
   * @returns {Object} Status dashboard
   */
  status() {
    const workflows = this.workflowManager.getAllWorkflows();
    const agents = this.agentCoordinator.getAllAgents();
    const resources = this.resourceManager.getAllResources();
    const escalations = this.escalationManager.getActiveEscalations();
    
    // Store in memory
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: 'ORCH: Dashboard status requested'
    });
    
    return {
      timestamp: new Date(),
      summary: {
        active_workflows: workflows.filter(w => w.status === 'active').length,
        total_agents: agents.length,
        available_agents: agents.filter(a => a.status === 'available').length,
        allocated_resources: resources.filter(r => r.status === 'allocated').length,
        active_escalations: escalations.length
      },
      workflows: workflows.map(w => ({
        id: w.id,
        name: w.name,
        status: w.status,
        phases: w.phases.length
      })),
      agents: agents.map(a => ({
        id: a.id,
        type: a.type,
        status: a.status,
        workload: a.currentWorkload.length
      })),
      resources: {
        total: resources.length,
        available: resources.filter(r => r.status === 'available').length,
        allocated: resources.filter(r => r.status === 'allocated').length
      },
      escalations: escalations.length
    };
  }

  /**
   * List all available agents, their status, and current assignments
   * @returns {Array} List of agents
   */
  agents() {
    const agents = this.agentCoordinator.getAllAgents();
    
    // Store in memory
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: 'ORCH: Agent list requested'
    });
    
    return agents.map(agent => ({
      id: agent.id,
      type: agent.type,
      status: agent.status,
      workload: agent.currentWorkload.length,
      utilization: agent.utilization
    }));
  }

  /**
   * Show active workflows, templates, and orchestration patterns
   * @returns {Array} List of workflows
   */
  workflows() {
    const workflows = this.workflowManager.getAllWorkflows();
    
    // Store in memory
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: 'ORCH: Workflow list requested'
    });
    
    return workflows.map(workflow => ({
      id: workflow.id,
      name: workflow.name,
      status: workflow.status,
      agents: workflow.agents,
      phases: workflow.phases.map(p => p.name),
      created: workflow.createdAt
    }));
  }

  /**
   * Intelligently delegate tasks to appropriate agents
   * @param {string} task - Task description
   * @param {string} agentType - Agent type
   * @param {string} context - Task context
   * @returns {Object} Delegation result
   */
  delegate(task, agentType, context) {
    // Find available agent of specified type
    const agents = this.agentCoordinator.getAllAgents();
    const availableAgent = agents.find(a => a.type === agentType && a.status === 'available');
    
    if (!availableAgent) {
      throw new Error(`No available agent of type ${agentType} found`);
    }
    
    // Create workload
    const workload = {
      id: `task-${Date.now()}`,
      description: task,
      context,
      assignedAt: new Date()
    };
    
    // Assign workload to agent
    this.agentCoordinator.assignWorkload(availableAgent.id, workload);
    
    // Store in memory
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:DELEG: Delegated task "${task}" to agent ${availableAgent.id}`
    });
    
    return {
      success: true,
      agentId: availableAgent.id,
      taskId: workload.id,
      message: `Task delegated to agent ${availableAgent.id}`
    };
  }

  /**
   * Set up coordination between specific agents
   * @param {Array} agentList - List of agent IDs
   * @param {string} objective - Coordination objective
   * @param {string} timeline - Coordination timeline
   * @returns {Object} Coordination result
   */
  coordinate(agentList, objective, timeline) {
    // Update agent statuses to indicate coordination
    agentList.forEach(agentId => {
      this.agentCoordinator.updateAgentStatus(agentId, 'coordinating');
    });
    
    // Store in memory
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:COORD: Coordinating agents ${agentList.join(', ')} for objective "${objective}"`
    });
    
    return {
      success: true,
      agents: agentList,
      objective,
      timeline,
      message: `Coordination established for ${agentList.length} agents`
    };
  }

  /**
   * Monitor performance across agents or workflows
   * @param {string} scope - Monitoring scope
   * @param {Array} metrics - Metrics to monitor
   * @returns {Object} Monitoring results
   */
  monitor(scope, metrics) {
    let results;
    
    switch (scope) {
      case 'workflows':
        results = this.performanceMonitor.getWorkflowMetrics();
        break;
      case 'bottlenecks':
        results = this.performanceMonitor.detectBottlenecks();
        break;
      case 'health':
        results = this.performanceMonitor.performHealthCheck();
        break;
      case 'risks':
        results = this.performanceMonitor.assessRisks();
        break;
      case 'predict':
        // Handle predict scope
        if (metrics && metrics.length > 0) {
          results = this.performanceMonitor.predictDelivery(metrics[0]);
        } else {
          results = { predictedCompletion: null, confidence: 0 };
        }
        break;
      default:
        throw new Error(`Unknown monitoring scope: ${scope}`);
    }
    
    // Store in memory
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:MONITOR: Monitored ${scope} with metrics ${metrics.join(', ')}`
    });
    
    return {
      scope,
      metrics,
      results,
      timestamp: new Date()
    };
  }

  /**
   * Optimize resource allocation or workflow efficiency
   * @param {string} target - Optimization target
   * @param {Object} constraints - Optimization constraints
   * @returns {Object} Optimization results
   */
  optimize(target, constraints) {
    let results;
    
    switch (target) {
      case 'resources':
        results = this.resourceManager.optimizeAllocation(constraints);
        break;
      case 'workflows':
        // In a real implementation, this would optimize workflow efficiency
        results = { message: 'Workflow optimization not yet implemented' };
        break;
      default:
        throw new Error(`Unknown optimization target: ${target}`);
    }
    
    // Store in memory
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:OPTIM: Optimized ${target} with constraints ${JSON.stringify(constraints)}`
    });
    
    return {
      target,
      constraints,
      results,
      timestamp: new Date()
    };
  }

  /**
   * Generate orchestration reports for stakeholders
   * @param {string} type - Report type
   * @param {Array} audience - Target audience
   * @param {string} timeframe - Report timeframe
   * @returns {Object} Report data
   */
  report(type, audience, timeframe) {
    let reportData;
    
    switch (type) {
      case 'status':
        reportData = this.status();
        break;
      case 'performance':
        reportData = this.performanceMonitor.performHealthCheck();
        break;
      case 'orchestrator':
        // Generate orchestrator-specific report
        reportData = {
          type: 'orchestrator',
          period: timeframe,
          metrics: this.performanceMonitor.getWorkflowMetrics()
        };
        break;
      default:
        throw new Error(`Unknown report type: ${type}`);
    }
    
    // Store in memory
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:REPORT: Generated ${type} report for ${audience.join(', ')}`
    });
    
    return {
      type,
      audience,
      timeframe,
      data: reportData,
      generated: new Date()
    };
  }

  /**
   * Escalate critical issues to appropriate stakeholders
   * @param {string} issue - Issue description
   * @param {string} context - Issue context
   * @param {string} urgency - Issue urgency level
   * @returns {Object} Escalation result
   */
  escalate(issue, context, urgency) {
    // Determine issue type based on context keywords
    let issueType = 'technical';
    if (context.toLowerCase().includes('process') || context.toLowerCase().includes('procedure')) {
      issueType = 'process';
    } else if (context.toLowerCase().includes('quality') || context.toLowerCase().includes('bug')) {
      issueType = 'quality';
    } else if (context.toLowerCase().includes('security') || context.toLowerCase().includes('vulnerability')) {
      issueType = 'security';
    }
    
    // Escalate issue
    const escalation = this.escalationManager.escalateIssue(issue, issueType, context);
    
    // Store in memory
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:ESCAL: Escalated issue "${issue}" with urgency ${urgency}`
    });
    
    return {
      success: true,
      escalationId: escalation.id,
      issueType,
      path: escalation.path,
      message: `Issue escalated through ${issueType} path`
    };
  }

  /**
   * Design new multi-agent workflow
   * @param {string} name - Workflow name
   * @param {Array} agents - Agents involved
   * @param {Array} phases - Workflow phases
   * @returns {Object} Workflow creation result
   */
  createWorkflow(name, agents, phases) {
    const workflowId = this.workflowManager.createWorkflow(name, agents, phases);
    
    // Store in memory
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:WORKFLOW: Created workflow "${name}" with ID ${workflowId}`
    });
    
    return {
      success: true,
      workflowId,
      message: `Workflow "${name}" created successfully`
    };
  }

  /**
   * Adjust existing workflow parameters
   * @param {string} workflowId - Workflow ID
   * @param {Object} changes - Changes to apply
   * @returns {Object} Modification result
   */
  modifyWorkflow(workflowId, changes) {
    this.workflowManager.modifyWorkflow(workflowId, changes);
    
    // Store in memory
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:WORKFLOW: Modified workflow ${workflowId}`
    });
    
    return {
      success: true,
      workflowId,
      changes,
      message: `Workflow ${workflowId} modified successfully`
    };
  }

  /**
   * Temporarily halt workflow execution
   * @param {string} workflowId - Workflow ID
   * @param {string} reason - Reason for pausing
   * @returns {Object} Pause result
   */
  pauseWorkflow(workflowId, reason) {
    this.workflowManager.pauseWorkflow(workflowId, reason);
    
    // Store in memory
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:WORKFLOW: Paused workflow ${workflowId} - ${reason}`
    });
    
    return {
      success: true,
      workflowId,
      reason,
      message: `Workflow ${workflowId} paused successfully`
    };
  }

  /**
   * Restart paused workflows
   * @param {string} workflowId - Workflow ID
   * @param {Object} adjustments - Adjustments to apply
   * @returns {Object} Resume result
   */
  resumeWorkflow(workflowId, adjustments) {
    this.workflowManager.resumeWorkflow(workflowId, adjustments);
    
    // Store in memory
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:WORKFLOW: Resumed workflow ${workflowId}`
    });
    
    return {
      success: true,
      workflowId,
      adjustments,
      message: `Workflow ${workflowId} resumed successfully`
    };
  }

  /**
   * Archive completed workflows
   * @param {string} workflowId - Workflow ID
   * @param {string} lessonsLearned - Lessons learned
   * @returns {Object} Archive result
   */
  archiveWorkflow(workflowId, lessonsLearned) {
    this.workflowManager.archiveWorkflow(workflowId, lessonsLearned);
    
    // Store in memory
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:WORKFLOW: Archived workflow ${workflowId} - ${lessonsLearned}`
    });
    
    return {
      success: true,
      workflowId,
      lessonsLearned,
      message: `Workflow ${workflowId} archived successfully`
    };
  }

  /**
   * Create workflow from existing template
   * @param {string} sourceId - Source workflow ID
   * @param {Object} modifications - Modifications to apply
   * @returns {Object} Clone result
   */
  cloneWorkflow(sourceId, modifications) {
    const newId = this.workflowManager.cloneWorkflow(sourceId, modifications);
    
    // Store in memory
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:WORKFLOW: Cloned workflow ${sourceId} to ${newId}`
    });
    
    return {
      success: true,
      sourceId,
      newId,
      modifications,
      message: `Workflow cloned successfully as ${newId}`
    };
  }

  /**
   * Coordinate synchronization between agents
   * @param {Array} agentList - Agents to synchronize
   * @param {string} topic - Synchronization topic
   * @param {string} format - Synchronization format
   * @returns {Object} Synchronization result
   */
  syncAgents(agentList, topic, format) {
    // In a real implementation, this would coordinate synchronization between agents
    // For now, we'll just update their status
    
    agentList.forEach(agentId => {
      this.agentCoordinator.updateAgentStatus(agentId, 'synchronizing');
    });
    
    // Store in memory
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:COORD: Synchronizing agents ${agentList.join(', ')} on topic "${topic}"`
    });
    
    return {
      success: true,
      agents: agentList,
      topic,
      format,
      message: `Synchronization initiated for ${agentList.length} agents`
    };
  }

  /**
   * Rebalance workloads across agents
   * @param {Array} agents - Agents to balance
   * @param {string} criteria - Balancing criteria
   * @returns {Object} Balancing result
   */
  balanceLoad(agents, criteria) {
    this.agentCoordinator.balanceWorkload(agents, criteria);
    
    // Store in memory
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:COORD: Balanced load for agents ${agents.join(', ')} using criteria "${criteria}"`
    });
    
    return {
      success: true,
      agents,
      criteria,
      message: `Workload balanced for ${agents.length} agents`
    };
  }

  /**
   * Manage clean handoffs between agents
   * @param {string} fromAgent - Source agent
   * @param {string} toAgent - Target agent
   * @param {Object} context - Handoff context
   * @returns {Object} Handoff result
   */
  handoff(fromAgent, toAgent, context) {
    this.agentCoordinator.coordinateHandoff(fromAgent, toAgent, context);
    
    // Store in memory
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:COORD: Handoff from ${fromAgent} to ${toAgent}`
    });
    
    return {
      success: true,
      fromAgent,
      toAgent,
      context,
      message: `Handoff coordinated from ${fromAgent} to ${toAgent}`
    };
  }

  /**
   * Facilitate resolution of agent conflicts
   * @param {Array} agents - Agents in conflict
   * @param {string} issue - Conflict issue
   * @returns {Object} Resolution result
   */
  conflictResolution(agents, issue) {
    const resolution = this.agentCoordinator.resolveConflict(agents, issue);
    
    // Store in memory
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:ESCAL: Conflict resolved between agents ${agents.join(', ')} - ${issue}`
    });
    
    return {
      success: resolution.resolved,
      agents,
      issue,
      resolution,
      message: `Conflict resolution ${resolution.resolved ? 'successful' : 'failed'}`
    };
  }

  /**
   * Coordinate knowledge sharing between agents
   * @param {Array} agents - Agents to train
   * @param {Array} skills - Skills to share
   * @returns {Object} Training result
   */
  crossTraining(agents, skills) {
    // In a real implementation, this would coordinate knowledge sharing
    // For now, we'll just log the request
    
    // Store in memory
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:COORD: Cross-training for agents ${agents.join(', ')} on skills ${skills.join(', ')}`
    });
    
    return {
      success: true,
      agents,
      skills,
      message: `Cross-training initiated for ${agents.length} agents`
    };
  }

  /**
   * Set up agent backup arrangements
   * @param {string} primaryAgent - Primary agent
   * @param {string} backupAgent - Backup agent
   * @returns {Object} Assignment result
   */
  backupAssignment(primaryAgent, backupAgent) {
    // Store in memory
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:COORD: Backup assignment - primary: ${primaryAgent}, backup: ${backupAgent}`
    });
    
    return {
      success: true,
      primaryAgent,
      backupAgent,
      message: `Backup assignment created for ${primaryAgent}`
    };
  }

  /**
   * Generate real-time visualization of workflow status
   * @param {string} workflowId - Workflow identifier
   * @returns {string} Mermaid diagram of workflow status
   */
  visualize(workflowId) {
    // Store in memory
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:VISUALIZE: Generating visualization for workflow ${workflowId}`
    });
    
    return this.workflowManager.getWorkflowVisualization(workflowId);
  }

  /**
   * Analyze workflow performance and identify bottlenecks
   * @returns {Object} Performance analysis results
   */
  analyzePerformance() {
    // Store in memory
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: 'ORCH:PERFORMANCE: Analyzing workflow performance'
    });
    
    const metrics = this.performanceMonitor.getWorkflowMetrics();
    const bottlenecks = this.performanceMonitor.detectBottlenecks();
    const health = this.performanceMonitor.performHealthCheck();
    const risks = this.performanceMonitor.assessRisks();
    
    return {
      timestamp: new Date(),
      metrics,
      bottlenecks,
      health,
      risks
    };
  }

  /**
   * Predict delivery dates based on current progress and trends
   * @param {string} workflowId - Workflow identifier
   * @param {Object} options - Prediction options
   * @returns {Object} Delivery prediction results
   */
  predictDelivery(workflowId, options = {}) {
    // Store in memory
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:PREDICT: Predicting delivery for workflow ${workflowId}`
    });
    
    const prediction = this.performanceMonitor.predictDelivery(workflowId);
    
    if (options.confidence) {
      return {
        ...prediction,
        confidenceExplanation: 'Prediction based on historical phase completion data',
        confidenceFactors: [
          'Historical phase duration data',
          'Current workflow progress',
          'Resource allocation status',
          'Active bottlenecks'
        ]
      };
    }
    
    return prediction;
  }
}

module.exports = BMADOrchestrator;