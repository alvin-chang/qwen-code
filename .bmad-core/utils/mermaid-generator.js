// Utility for generating Mermaid diagrams for BMAD orchestrator
class MermaidGenerator {
  /**
   * Generate a workflow diagram in Mermaid format
   * @param {Object} workflow - Workflow data
   * @returns {string} Mermaid diagram code
   */
  static generateWorkflowDiagram(workflow) {
    let diagram = '```mermaid\n';
    diagram += 'graph TD\n';
    
    // Add workflow phases
    if (workflow.phases && Array.isArray(workflow.phases)) {
      workflow.phases.forEach((phase, index) => {
        const nodeId = `P${index}`;
        diagram += `    ${nodeId}[\"${phase.name}\"]\n`;
        
        // Connect to previous phase
        if (index > 0) {
          const prevNodeId = `P${index - 1}`;
          diagram += `    ${prevNodeId} --> ${nodeId}\n`;
        }
        
        // Add agents involved in this phase
        if (phase.agents && Array.isArray(phase.agents)) {
          phase.agents.forEach((agent, agentIndex) => {
            const agentNodeId = `A${index}_${agentIndex}`;
            diagram += `    ${agentNodeId}[\"${agent}\"]\n`;
            diagram += `    ${nodeId} --> ${agentNodeId}\n`;
          });
        }
      });
    }
    
    diagram += '```\n';
    return diagram;
  }
  
  /**
   * Generate an agent status diagram in Mermaid format
   * @param {Array} agents - Array of agent objects
   * @returns {string} Mermaid diagram code
   */
  static generateAgentStatusDiagram(agents) {
    let diagram = '```mermaid\n';
    diagram += 'graph LR\n';
    
    // Add agents with status colors
    agents.forEach((agent, index) => {
      const nodeId = `AGENT${index}`;
      const status = agent.status || 'unknown';
      const statusColor = this.getStatusColor(status);
      
      diagram += `    ${nodeId}[\"${agent.name}\\n${agent.role}\\n${status}\"]\n`;
      diagram += `    style ${nodeId} fill:${statusColor},color:#fff\n`;
    });
    
    diagram += '```\n';
    return diagram;
  }
  
  /**
   * Get color for status
   * @param {string} status - Status string
   * @returns {string} Color code
   */
  static getStatusColor(status) {
    const colorMap = {
      'active': '#34a853',      // Green
      'busy': '#f9ab00',        // Orange
      'idle': '#e8eaed',        // Light gray
      'error': '#d93025',       // Red
      'offline': '#5f6368',     // Dark gray
      'unknown': '#9aa0a6'      // Medium gray
    };
    
    return colorMap[status] || colorMap['unknown'];
  }
  
  /**
   * Generate a resource allocation diagram in Mermaid format
   * @param {Object} resources - Resource allocation data
   * @returns {string} Mermaid diagram code
   */
  static generateResourceAllocationDiagram(resources) {
    let diagram = '```mermaid\n';
    diagram += 'pie showData\n';
    diagram += '    title Resource Allocation\n';
    
    // Add resource data
    Object.entries(resources).forEach(([resource, allocation]) => {
      diagram += `    \"${resource}\" : ${allocation}\n`;
    });
    
    diagram += '```\n';
    return diagram;
  }
  
  /**
   * Generate a timeline diagram in Mermaid format
   * @param {Array} milestones - Array of milestone objects
   * @returns {string} Mermaid diagram code
   */
  static generateTimelineDiagram(milestones) {
    let diagram = '```mermaid\n';
    diagram += 'gantt\n';
    diagram += '    title Project Timeline\n';
    diagram += '    dateFormat  YYYY-MM-DD\n';
    diagram += '    section Milestones\n';
    
    // Add milestones
    milestones.forEach(milestone => {
      const status = milestone.completed ? 'done' : 'active';
      diagram += `    ${milestone.name} :${status}, ${milestone.start}, ${milestone.duration}d\n`;
    });
    
    diagram += '```\n';
    return diagram;
  }
}

module.exports = MermaidGenerator;