// BMAD™ Orchestrator - Escalation Manager
// Copyright © 2025 BMAD™. All rights reserved.

// Global store_memory function (to be implemented by the environment)
// eslint-disable-next-line no-undef
const store_memory = typeof global.store_memory !== 'undefined' ? global.store_memory : console.log;

class EscalationManager {
  constructor() {
    this.escalationPaths = new Map();
    this.activeEscalations = new Map();
  }

  /**
   * Define escalation path
   * @param {string} issueType - Type of issue
   * @param {Array} path - Escalation path (list of roles/persons)
   */
  defineEscalationPath(issueType, path) {
    this.escalationPaths.set(issueType, path);
    
    // Store in memory with proper prefix
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:ESCALATION: Defined escalation path for ${issueType}`
    });
  }

  /**
   * Escalate issue
   * @param {string} issue - Issue description
   * @param {string} issueType - Type of issue
   * @param {string} from - Source of escalation
   * @returns {Object} Escalation details
   */
  escalateIssue(issue, issueType, from) {
    const path = this.escalationPaths.get(issueType);
    if (!path || path.length === 0) {
      throw new Error(`No escalation path defined for ${issueType}`);
    }
    
    const escalationId = `escalation-${Date.now()}`;
    const escalation = {
      id: escalationId,
      issue,
      issueType,
      from,
      path,
      currentLevel: 0,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.activeEscalations.set(escalationId, escalation);
    
    // Store in memory with proper prefix
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:ESCALATION: Escalated issue - ${issue} (${issueType}) from ${from}`
    });
    
    return escalation;
  }

  /**
   * Resolve escalation
   * @param {string} escalationId - Escalation identifier
   * @param {string} resolution - Resolution details
   */
  resolveEscalation(escalationId, resolution) {
    const escalation = this.activeEscalations.get(escalationId);
    if (!escalation) {
      throw new Error(`Escalation ${escalationId} not found`);
    }
    
    escalation.status = 'resolved';
    escalation.resolution = resolution;
    escalation.resolvedAt = new Date();
    escalation.updatedAt = new Date();
    
    // Store in memory with proper prefix
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:ESCALATION: Resolved escalation ${escalationId} - ${resolution}`
    });
  }

  /**
   * Get active escalations
   * @returns {Array} List of active escalations
   */
  getActiveEscalations() {
    return Array.from(this.activeEscalations.values()).filter(e => e.status === 'active');
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
      resolvedBy: 'orchestrator',
      timestamp: new Date(),
      notes: `Conflict between agents ${agentIds.join(', ')} resolved through mediation`
    };
    
    // Store in memory with proper prefix
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:ESCALATION: Conflict resolved between agents ${agentIds.join(', ')} - ${issue}`
    });
    
    return resolution;
  }
}

module.exports = EscalationManager;