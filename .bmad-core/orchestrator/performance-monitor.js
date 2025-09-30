// BMAD™ Orchestrator - Performance Monitor
// Copyright © 2025 BMAD™. All rights reserved.

const WorkflowMonitor = require('../utils/workflow-monitor');
const MemoryAnalytics = require('../utils/memory-analytics');

// Global store_memory function (to be implemented by the environment)
// eslint-disable-next-line no-undef
const store_memory = typeof global.store_memory !== 'undefined' ? global.store_memory : console.log;

class PerformanceMonitor {
  constructor(workflowMonitor = null) {
    this.workflowMonitor = workflowMonitor || new WorkflowMonitor();
    this.memoryAnalytics = new MemoryAnalytics();
  }

  /**
   * Get performance metrics for workflows
   * @returns {Object} Performance metrics
   */
  getWorkflowMetrics() {
    return this.workflowMonitor.getMetrics();
  }

  /**
   * Detect bottlenecks in workflows
   * @returns {Array} List of detected bottlenecks
   */
  detectBottlenecks() {
    return this.workflowMonitor.detectBottlenecks();
  }

  /**
   * Predict delivery timeline
   * @param {string} workflowId - Workflow identifier
   * @returns {Object} Delivery prediction
   */
  predictDelivery(workflowId) {
    const workflow = this.workflowMonitor.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }
    
    // Simple prediction algorithm
    // In a real implementation, this would be more sophisticated
    const now = new Date();
    const startedPhases = workflow.phases.filter(p => p.startTime);
    const completedPhases = workflow.phases.filter(p => p.endTime);
    
    if (startedPhases.length === 0) {
      return { predictedCompletion: null, confidence: 0 };
    }
    
    // Calculate average phase duration
    const avgDuration = completedPhases.reduce((sum, phase) => {
      return sum + (phase.endTime - phase.startTime);
    }, 0) / Math.max(1, completedPhases.length);
    
    // Predict remaining time
    const remainingPhases = workflow.phases.length - completedPhases.length;
    const predictedCompletion = new Date(now.getTime() + (avgDuration * remainingPhases));
    
    return {
      predictedCompletion,
      confidence: completedPhases.length / Math.max(1, startedPhases.length),
      avgPhaseDuration: avgDuration,
      remainingPhases
    };
  }

  /**
   * Perform system health check
   * @returns {Object} Health check results
   */
  performHealthCheck() {
    const metrics = this.workflowMonitor.getMetrics();
    const bottlenecks = this.workflowMonitor.detectBottlenecks();
    const memoryStats = this.memoryAnalytics.generateUsageReport();
    
    return {
      systemHealth: 'operational',
      workflowMetrics: metrics,
      activeBottlenecks: bottlenecks,
      memoryHealth: memoryStats,
      timestamp: new Date()
    };
  }

  /**
   * Assess risks in workflows
   * @returns {Array} List of identified risks
   */
  assessRisks() {
    const workflows = this.workflowMonitor.getAllWorkflows();
    const bottlenecks = this.workflowMonitor.detectBottlenecks();
    
    const risks = [];
    
    // Check for overdue workflows
    workflows.forEach(workflow => {
      if (workflow.status === 'active') {
        const now = new Date();
        const created = new Date(workflow.createdAt);
        const ageInDays = (now - created) / (1000 * 60 * 60 * 24);
        
        if (ageInDays > 7) {
          risks.push({
            type: 'workflow_age',
            workflowId: workflow.id,
            severity: 'medium',
            description: `Workflow has been active for ${Math.floor(ageInDays)} days`,
            timestamp: now
          });
        }
      }
    });
    
    // Add bottleneck-related risks
    bottlenecks.forEach(bottleneck => {
      risks.push({
        type: 'bottleneck',
        ...bottleneck,
        severity: 'high',
        timestamp: new Date()
      });
    });
    
    return risks;
  }
}

module.exports = PerformanceMonitor;