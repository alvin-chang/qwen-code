// BMAD™ Orchestrator - Command Processor
// Copyright © 2025 BMAD™. All rights reserved.

const BMADOrchestrator = require('./bmad-orchestrator');

class OrchestratorCommandProcessor {
  constructor() {
    this.orchestrator = new BMADOrchestrator();
  }

  /**
   * Process orchestrator command
   * @param {string} command - Command string
   * @returns {Object} Command result
   */
  processCommand(command) {
    // Remove leading asterisk if present
    if (command.startsWith('*')) {
      command = command.substring(1);
    }
    
    // Split command into parts
    const parts = command.trim().split(/\s+/);
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    // Process command
    switch (commandName) {
      case 'help':
        return { type: 'output', content: this.orchestrator.help() };
        
      case 'status':
        return { type: 'data', content: this.orchestrator.status() };
        
      case 'agents':
        return { type: 'data', content: this.orchestrator.agents() };
        
      case 'workflows':
        return { type: 'data', content: this.orchestrator.workflows() };
        
      case 'delegate':
        if (args.length < 3) {
          throw new Error('Delegate command requires task, agent-type, and context');
        }
        return { type: 'data', content: this.orchestrator.delegate(args[0], args[1], args[2]) };
        
      case 'coordinate':
        if (args.length < 3) {
          throw new Error('Coordinate command requires agents, objective, and timeline');
        }
        return { type: 'data', content: this.orchestrator.coordinate(args[0].split(','), args[1], args[2]) };
        
      case 'monitor':
        if (args.length < 2) {
          throw new Error('Monitor command requires scope and metrics');
        }
        return { type: 'data', content: this.orchestrator.monitor(args[0], args[1].split(',')) };
        
      case 'optimize':
        if (args.length < 2) {
          throw new Error('Optimize command requires target and constraints');
        }
        return { type: 'data', content: this.orchestrator.optimize(args[0], JSON.parse(args[1])) };
        
      case 'report':
        if (args.length < 3) {
          throw new Error('Report command requires type, audience, and timeframe');
        }
        return { type: 'data', content: this.orchestrator.report(args[0], args[1].split(','), args[2]) };
        
      case 'escalate':
        if (args.length < 3) {
          throw new Error('Escalate command requires issue, context, and urgency');
        }
        return { type: 'data', content: this.orchestrator.escalate(args[0], args[1], args[2]) };
        
      case 'create-workflow':
        if (args.length < 3) {
          throw new Error('Create-workflow command requires name, agents, and phases');
        }
        return { type: 'data', content: this.orchestrator.createWorkflow(args[0], args[1].split(','), args[2].split(',')) };
        
      case 'modify-workflow':
        if (args.length < 2) {
          throw new Error('Modify-workflow command requires workflow-id and changes');
        }
        return { type: 'data', content: this.orchestrator.modifyWorkflow(args[0], JSON.parse(args[1])) };
        
      case 'pause-workflow':
        if (args.length < 2) {
          throw new Error('Pause-workflow command requires workflow-id and reason');
        }
        return { type: 'data', content: this.orchestrator.pauseWorkflow(args[0], args[1]) };
        
      case 'resume-workflow':
        if (args.length < 2) {
          throw new Error('Resume-workflow command requires workflow-id and adjustments');
        }
        return { type: 'data', content: this.orchestrator.resumeWorkflow(args[0], JSON.parse(args[1])) };
        
      case 'archive-workflow':
        if (args.length < 2) {
          throw new Error('Archive-workflow command requires workflow-id and lessons-learned');
        }
        return { type: 'data', content: this.orchestrator.archiveWorkflow(args[0], args[1]) };
        
      case 'clone-workflow':
        if (args.length < 2) {
          throw new Error('Clone-workflow command requires source-id and modifications');
        }
        return { type: 'data', content: this.orchestrator.cloneWorkflow(args[0], JSON.parse(args[1])) };
        
      case 'sync-agents':
        if (args.length < 3) {
          throw new Error('Sync-agents command requires agent-list, topic, and format');
        }
        return { type: 'data', content: this.orchestrator.syncAgents(args[0].split(','), args[1], args[2]) };
        
      case 'balance-load':
        if (args.length < 2) {
          throw new Error('Balance-load command requires agents and criteria');
        }
        return { type: 'data', content: this.orchestrator.balanceLoad(args[0].split(','), args[1]) };
        
      case 'handoff':
        if (args.length < 3) {
          throw new Error('Handoff command requires from-agent, to-agent, and context');
        }
        return { type: 'data', content: this.orchestrator.handoff(args[0], args[1], JSON.parse(args[2])) };
        
      case 'conflict-resolution':
        if (args.length < 2) {
          throw new Error('Conflict-resolution command requires agents and issue');
        }
        return { type: 'data', content: this.orchestrator.conflictResolution(args[0].split(','), args[1]) };
        
      case 'cross-training':
        if (args.length < 2) {
          throw new Error('Cross-training command requires agents and skills');
        }
        return { type: 'data', content: this.orchestrator.crossTraining(args[0].split(','), args[1].split(',')) };
        
      case 'backup-assignment':
        if (args.length < 2) {
          throw new Error('Backup-assignment command requires primary-agent and backup-agent');
        }
        return { type: 'data', content: this.orchestrator.backupAssignment(args[0], args[1]) };
        
      default:
        throw new Error(`Unknown command: ${commandName}`);
    }
  }
}

module.exports = OrchestratorCommandProcessor;