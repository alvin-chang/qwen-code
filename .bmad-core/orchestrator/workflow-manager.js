// BMAD™ Orchestrator - Workflow Manager
// Copyright © 2025 BMAD™. All rights reserved.

const WorkflowMonitor = require('../utils/workflow-monitor');
const MermaidGenerator = require('../utils/mermaid-generator');
const fs = require('fs-extra');
const path = require('path');

// Global store_memory function (to be implemented by the environment)
// eslint-disable-next-line no-undef
const store_memory = typeof global.store_memory !== 'undefined' ? global.store_memory : console.log;

class WorkflowManager {
  constructor() {
    this.monitor = new WorkflowMonitor();
    this.visualizer = MermaidGenerator; // Use the static class directly
    
    // Initialize workflows storage directory
    this.storageDir = path.join(process.cwd(), '.ai', 'memory', 'workflows');
    this.workflows = new Map();
    
    // Load existing workflows from persistent storage
    this.loadWorkflowsFromStorage();
  }
  
  /**
   * Load workflows from persistent storage
   */
  loadWorkflowsFromStorage() {
    try {
      // Ensure storage directory exists
      fs.ensureDirSync(this.storageDir);
      
      // Read all workflow files from storage directory
      const files = fs.readdirSync(this.storageDir);
      
      // Load each workflow file
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const filePath = path.join(this.storageDir, file);
            const workflow = fs.readJsonSync(filePath);
            this.workflows.set(workflow.id, workflow);
            this.monitor.registerWorkflow(workflow);
          } catch (fileError) {
            // Skip files that can't be read or parsed
            continue;
          }
        }
      }
      
      // Store in memory with proper prefix
      store_memory({
        agent_role: 'ORCHESTRATOR',
        project_id: process.env.PROJECT_ID || 'default',
        content: `ORCH:WORKFLOW: Loaded ${this.workflows.size} workflows from storage`
      });
    } catch (error) {
      // Log error but don't fail initialization
      store_memory({
        agent_role: 'ORCHESTRATOR',
        project_id: process.env.PROJECT_ID || 'default',
        content: `ORCH:WORKFLOW: Error loading workflows from storage: ${error.message}`
      });
    }
  }
  
  /**
   * Save workflow to persistent storage
   * @param {string} workflowId - Workflow identifier
   */
  saveWorkflowToStorage(workflowId) {
    try {
      const workflow = this.workflows.get(workflowId);
      if (workflow) {
        // Ensure storage directory exists
        fs.ensureDirSync(this.storageDir);
        
        // Save workflow to file
        const filePath = path.join(this.storageDir, `${workflowId}.json`);
        fs.writeJsonSync(filePath, workflow, { spaces: 2 });
      }
    } catch (error) {
      // Log error but don't fail workflow creation
      store_memory({
        agent_role: 'ORCHESTRATOR',
        project_id: process.env.PROJECT_ID || 'default',
        content: `ORCH:WORKFLOW: Error saving workflow ${workflowId} to storage: ${error.message}`
      });
    }
  }
  
  /**
   * Delete workflow from persistent storage
   * @param {string} workflowId - Workflow identifier
   */
  deleteWorkflowFromStorage(workflowId) {
    try {
      const filePath = path.join(this.storageDir, `${workflowId}.json`);
      if (fs.pathExistsSync(filePath)) {
        fs.removeSync(filePath);
      }
    } catch (error) {
      // Log error but don't fail workflow deletion
      store_memory({
        agent_role: 'ORCHESTRATOR',
        project_id: process.env.PROJECT_ID || 'default',
        content: `ORCH:WORKFLOW: Error deleting workflow ${workflowId} from storage: ${error.message}`
      });
    }
  }

  /**
   * Create a new workflow
   * @param {string} name - Workflow name
   * @param {Array<string>} agents - List of agent types involved
   * @param {Array<string>} phases - Workflow phases
   * @returns {string} Workflow ID
   */
  createWorkflow(name, agents, phases) {
    const workflowId = `workflow-${Date.now()}`;
    const workflow = {
      id: workflowId,
      name,
      agents,
      phases: phases.map(phase => ({
        name: phase,
        status: 'pending',
        startTime: null,
        endTime: null
      })),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.workflows.set(workflowId, workflow);
    this.monitor.registerWorkflow(workflow);
    
    // Store in memory with proper prefix
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:WORKFLOW: Created workflow ${name} with ID ${workflowId}`
    });
    
    // Save to persistent storage
    this.saveWorkflowToStorage(workflowId);
    
    return workflowId;
  }

  /**
   * Modify an existing workflow
   * @param {string} workflowId - Workflow ID
   * @param {Object} changes - Changes to apply
   */
  modifyWorkflow(workflowId, changes) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }
    
    Object.assign(workflow, changes, { updatedAt: new Date().toISOString() });
    this.monitor.updateWorkflow(workflowId, changes);
    
    // Store in memory with proper prefix
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:WORKFLOW: Modified workflow ${workflowId}`
    });
    
    // Save to persistent storage
    this.saveWorkflowToStorage(workflowId);
  }

  /**
   * Pause a workflow
   * @param {string} workflowId - Workflow ID
   * @param {string} reason - Reason for pausing
   */
  pauseWorkflow(workflowId, reason) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }
    
    workflow.status = 'paused';
    workflow.pausedReason = reason;
    workflow.updatedAt = new Date().toISOString();
    
    this.monitor.updateWorkflow(workflowId, { 
      status: 'paused',
      pausedReason: reason
    });
    
    // Store in memory with proper prefix
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:WORKFLOW: Paused workflow ${workflowId} - ${reason}`
    });
    
    // Save to persistent storage
    this.saveWorkflowToStorage(workflowId);
  }

  /**
   * Resume a paused workflow
   * @param {string} workflowId - Workflow ID
   * @param {Object} adjustments - Adjustments to apply
   */
  resumeWorkflow(workflowId, adjustments) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }
    
    workflow.status = 'active';
    delete workflow.pausedReason;
    
    if (adjustments) {
      Object.assign(workflow, adjustments);
    }
    
    workflow.updatedAt = new Date().toISOString();
    
    this.monitor.updateWorkflow(workflowId, {
      status: 'active',
      ...adjustments
    });
    
    // Store in memory with proper prefix
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:WORKFLOW: Resumed workflow ${workflowId}`
    });
    
    // Save to persistent storage
    this.saveWorkflowToStorage(workflowId);
  }

  /**
   * Archive a completed workflow
   * @param {string} workflowId - Workflow ID
   * @param {string} lessonsLearned - Lessons learned from the workflow
   */
  archiveWorkflow(workflowId, lessonsLearned) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }
    
    workflow.status = 'archived';
    workflow.lessonsLearned = lessonsLearned;
    workflow.archivedAt = new Date().toISOString();
    workflow.updatedAt = new Date().toISOString();
    
    this.monitor.updateWorkflow(workflowId, {
      status: 'archived',
      lessonsLearned,
      archivedAt: workflow.archivedAt
    });
    
    // Store in memory with proper prefix
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:WORKFLOW: Archived workflow ${workflowId} - ${lessonsLearned}`
    });
    
    // Save to persistent storage
    this.saveWorkflowToStorage(workflowId);
  }

  /**
   * Clone an existing workflow as a template
   * @param {string} sourceId - Source workflow ID
   * @param {Object} modifications - Modifications to apply to the clone
   * @returns {string} New workflow ID
   */
  cloneWorkflow(sourceId, modifications) {
    const sourceWorkflow = this.workflows.get(sourceId);
    if (!sourceWorkflow) {
      throw new Error(`Source workflow ${sourceId} not found`);
    }
    
    // Create a deep copy of the source workflow
    const clonedWorkflow = JSON.parse(JSON.stringify(sourceWorkflow));
    
    // Apply modifications
    if (modifications) {
      Object.assign(clonedWorkflow, modifications);
    }
    
    // Generate new ID and reset timestamps
    const newId = `workflow-${Date.now()}`;
    clonedWorkflow.id = newId;
    clonedWorkflow.createdAt = new Date().toISOString();
    clonedWorkflow.updatedAt = new Date().toISOString();
    delete clonedWorkflow.archivedAt;
    delete clonedWorkflow.lessonsLearned;
    
    // Reset status and phase timestamps
    clonedWorkflow.status = 'pending';
    clonedWorkflow.phases.forEach(phase => {
      phase.status = 'pending';
      phase.startTime = null;
      phase.endTime = null;
    });
    
    this.workflows.set(newId, clonedWorkflow);
    this.monitor.registerWorkflow(clonedWorkflow);
    
    // Store in memory with proper prefix
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:WORKFLOW: Cloned workflow ${sourceId} to ${newId}`
    });
    
    // Save to persistent storage
    this.saveWorkflowToStorage(newId);
    
    return newId;
  }

  /**
   * Get workflow status visualization
   * @param {string} workflowId - Workflow ID
   * @returns {string} Mermaid diagram of workflow status
   */
  getWorkflowVisualization(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }
    
    return this.visualizer.generateWorkflowDiagram(workflow);
  }

  /**
   * Get all workflows
   * @returns {Array} List of all workflows
   */
  getAllWorkflows() {
    return Array.from(this.workflows.values());
  }
}

module.exports = WorkflowManager;