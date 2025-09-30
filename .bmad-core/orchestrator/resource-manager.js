// BMAD™ Orchestrator - Resource Manager
// Copyright © 2025 BMAD™. All rights reserved.

// Global store_memory function (to be implemented by the environment)
// eslint-disable-next-line no-undef
const store_memory = typeof global.store_memory !== 'undefined' ? global.store_memory : console.log;

class ResourceManager {
  constructor() {
    this.resources = new Map();
    this.allocations = new Map();
  }

  /**
   * Register a resource
   * @param {string} resourceId - Unique resource identifier
   * @param {string} type - Resource type
   * @param {Object} properties - Resource properties
   */
  registerResource(resourceId, type, properties) {
    const resource = {
      id: resourceId,
      type,
      properties,
      status: 'available',
      allocatedTo: null,
      allocatedAt: null,
      registeredAt: new Date()
    };
    
    this.resources.set(resourceId, resource);
    
    // Store in memory with proper prefix
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:RESOURCE: Registered resource ${resourceId} of type ${type}`
    });
  }

  /**
   * Allocate resource to workflow/agent
   * @param {string} resourceId - Resource identifier
   * @param {string} allocatedTo - Entity to allocate to (workflow/agent)
   * @returns {boolean} Success status
   */
  allocateResource(resourceId, allocatedTo) {
    const resource = this.resources.get(resourceId);
    if (!resource) {
      throw new Error(`Resource ${resourceId} not found`);
    }
    
    if (resource.status !== 'available') {
      return false;
    }
    
    resource.status = 'allocated';
    resource.allocatedTo = allocatedTo;
    resource.allocatedAt = new Date();
    resource.updatedAt = new Date();
    
    // Track allocation
    if (!this.allocations.has(allocatedTo)) {
      this.allocations.set(allocatedTo, []);
    }
    this.allocations.get(allocatedTo).push(resourceId);
    
    // Store in memory with proper prefix
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:RESOURCE: Allocated resource ${resourceId} to ${allocatedTo}`
    });
    
    return true;
  }

  /**
   * Release resource
   * @param {string} resourceId - Resource identifier
   * @returns {boolean} Success status
   */
  releaseResource(resourceId) {
    const resource = this.resources.get(resourceId);
    if (!resource) {
      throw new Error(`Resource ${resourceId} not found`);
    }
    
    if (resource.status !== 'allocated') {
      return false;
    }
    
    // Remove from allocation tracking
    if (resource.allocatedTo && this.allocations.has(resource.allocatedTo)) {
      const allocations = this.allocations.get(resource.allocatedTo);
      const index = allocations.indexOf(resourceId);
      if (index !== -1) {
        allocations.splice(index, 1);
      }
    }
    
    resource.status = 'available';
    resource.allocatedTo = null;
    resource.allocatedAt = null;
    resource.updatedAt = new Date();
    
    // Store in memory with proper prefix
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:RESOURCE: Released resource ${resourceId}`
    });
    
    return true;
  }

  /**
   * Optimize resource allocation
   * @param {Object} constraints - Allocation constraints
   * @returns {Object} Optimization results
   */
  optimizeAllocation(constraints) {
    // Simple optimization algorithm
    // In a real implementation, this would be more sophisticated
    const availableResources = Array.from(this.resources.values()).filter(r => r.status === 'available');
    const allocatedResources = Array.from(this.resources.values()).filter(r => r.status === 'allocated');
    
    const optimization = {
      available: availableResources.length,
      allocated: allocatedResources.length,
      utilization: allocatedResources.length / Math.max(1, this.resources.size),
      recommendations: []
    };
    
    // Simple recommendation - if utilization is low, suggest consolidation
    if (optimization.utilization < 0.3) {
      optimization.recommendations.push('Consider consolidating resources due to low utilization');
    }
    
    // Store in memory with proper prefix
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:RESOURCE: Optimized resource allocation - ${optimization.utilization * 100}% utilization`
    });
    
    return optimization;
  }

  /**
   * Plan capacity
   * @param {Array} upcomingWorkloads - Upcoming workloads
   * @returns {Object} Capacity plan
   */
  planCapacity(upcomingWorkloads) {
    // Simple capacity planning
    // In a real implementation, this would be more sophisticated
    const currentCapacity = this.resources.size;
    const projectedDemand = upcomingWorkloads.length;
    
    const plan = {
      currentCapacity,
      projectedDemand,
      shortfall: Math.max(0, projectedDemand - currentCapacity),
      recommendations: []
    };
    
    if (plan.shortfall > 0) {
      plan.recommendations.push(`Acquire ${plan.shortfall} additional resources to meet demand`);
    }
    
    // Store in memory with proper prefix
    store_memory({
      agent_role: 'ORCHESTRATOR',
      project_id: process.env.PROJECT_ID || 'default',
      content: `ORCH:RESOURCE: Capacity planning - ${projectedDemand} demand, ${currentCapacity} capacity`
    });
    
    return plan;
  }

  /**
   * Get all resources
   * @returns {Array} List of all resources
   */
  getAllResources() {
    return Array.from(this.resources.values());
  }

  /**
   * Get allocations for entity
   * @param {string} entityId - Entity identifier
   * @returns {Array} List of allocated resources
   */
  getAllocations(entityId) {
    return this.allocations.get(entityId) || [];
  }
}

module.exports = ResourceManager;