#!/usr/bin/env node

// BMAD™ Orchestrator CLI
// Copyright © 2025 BMAD™. All rights reserved.

const { Command } = require('commander');
const { BMADOrchestrator } = require('./index');

// Create orchestrator instance
const orchestrator = new BMADOrchestrator();

// Create CLI program
const program = new Command();

// Configure program
program
  .name('bmad-orchestrator')
  .description('Enhanced BMAD™ Orchestrator - Multi-Agent System Coordinator & Workflow Manager with Advanced Visualization, Performance Analytics, and Delivery Prediction')
  .version('4.43.0');

// Helper function to safely output data
function outputData(data) {
  if (typeof data === 'string') {
    console.log(data);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

// Helper function to handle errors
function handleError(error) {
  console.error('Error:', error.message);
  process.exit(1);
}

// Core Commands
program
  .command('help')
  .description('Show all available orchestrator commands and workflows')
  .action(() => {
    try {
      outputData(orchestrator.help());
    } catch (error) {
      handleError(error);
    }
  });

program
  .command('status')
  .description('Display current orchestration dashboard with all active workflows')
  .action(() => {
    try {
      outputData(orchestrator.status());
    } catch (error) {
      handleError(error);
    }
  });

program
  .command('agents')
  .description('List all available agents, their status, and current assignments')
  .action(() => {
    try {
      outputData(orchestrator.agents());
    } catch (error) {
      handleError(error);
    }
  });

program
  .command('workflows')
  .description('Show active workflows, templates, and orchestration patterns')
  .action(() => {
    try {
      outputData(orchestrator.workflows());
    } catch (error) {
      handleError(error);
    }
  });

program
  .command('delegate')
  .description('Intelligently delegate tasks to appropriate agents')
  .argument('<task>', 'Task description')
  .argument('<agent-type>', 'Agent type')
  .argument('<context>', 'Task context')
  .action((task, agentType, context) => {
    try {
      outputData(orchestrator.delegate(task, agentType, context));
    } catch (error) {
      handleError(error);
    }
  });

program
  .command('coordinate')
  .description('Set up coordination between specific agents')
  .argument('<agents>', 'Comma-separated list of agent IDs')
  .argument('<objective>', 'Coordination objective')
  .argument('<timeline>', 'Coordination timeline')
  .action((agents, objective, timeline) => {
    try {
      const agentList = agents.split(',');
      outputData(orchestrator.coordinate(agentList, objective, timeline));
    } catch (error) {
      handleError(error);
    }
  });

program
  .command('monitor')
  .description('Monitor performance across agents or workflows')
  .argument('<scope>', 'Monitoring scope (workflows, bottlenecks, health, risks)')
  .argument('<metrics>', 'Comma-separated list of metrics to monitor')
  .action((scope, metrics) => {
    try {
      const metricList = metrics.split(',');
      outputData(orchestrator.monitor(scope, metricList));
    } catch (error) {
      handleError(error);
    }
  });

program
  .command('optimize')
  .description('Optimize resource allocation or workflow efficiency')
  .argument('<target>', 'Optimization target (resources, workflows)')
  .argument('<constraints>', 'Optimization constraints (JSON string)')
  .action((target, constraints) => {
    try {
      const constraintObj = JSON.parse(constraints);
      outputData(orchestrator.optimize(target, constraintObj));
    } catch (error) {
      handleError(error);
    }
  });

program
  .command('report')
  .description('Generate orchestration reports for stakeholders')
  .argument('<type>', 'Report type (status, performance, orchestrator)')
  .argument('<audience>', 'Comma-separated list of target audience')
  .argument('<timeframe>', 'Report timeframe')
  .action((type, audience, timeframe) => {
    try {
      const audienceList = audience.split(',');
      outputData(orchestrator.report(type, audienceList, timeframe));
    } catch (error) {
      handleError(error);
    }
  });

program
  .command('escalate')
  .description('Escalate critical issues to appropriate stakeholders')
  .argument('<issue>', 'Issue description')
  .argument('<context>', 'Issue context')
  .argument('<urgency>', 'Issue urgency level')
  .action((issue, context, urgency) => {
    try {
      outputData(orchestrator.escalate(issue, context, urgency));
    } catch (error) {
      handleError(error);
    }
  });

// Workflow Management Commands
program
  .command('create-workflow')
  .description('Design new multi-agent workflow')
  .argument('<name>', 'Workflow name')
  .argument('<agents>', 'Comma-separated list of agents involved')
  .argument('<phases>', 'Comma-separated list of workflow phases')
  .action((name, agents, phases) => {
    try {
      const agentList = agents.split(',');
      const phaseList = phases.split(',');
      outputData(orchestrator.createWorkflow(name, agentList, phaseList));
    } catch (error) {
      handleError(error);
    }
  });

program
  .command('modify-workflow')
  .description('Adjust existing workflow parameters')
  .argument('<workflow-id>', 'Workflow ID')
  .argument('<changes>', 'Changes to apply (JSON string)')
  .action((workflowId, changes) => {
    try {
      const changesObj = JSON.parse(changes);
      outputData(orchestrator.modifyWorkflow(workflowId, changesObj));
    } catch (error) {
      handleError(error);
    }
  });

program
  .command('pause-workflow')
  .description('Temporarily halt workflow execution')
  .argument('<workflow-id>', 'Workflow ID')
  .argument('<reason>', 'Reason for pausing')
  .action((workflowId, reason) => {
    try {
      outputData(orchestrator.pauseWorkflow(workflowId, reason));
    } catch (error) {
      handleError(error);
    }
  });

program
  .command('resume-workflow')
  .description('Restart paused workflows')
  .argument('<workflow-id>', 'Workflow ID')
  .argument('<adjustments>', 'Adjustments to apply (JSON string)')
  .action((workflowId, adjustments) => {
    try {
      const adjustmentsObj = JSON.parse(adjustments);
      outputData(orchestrator.resumeWorkflow(workflowId, adjustmentsObj));
    } catch (error) {
      handleError(error);
    }
  });

program
  .command('archive-workflow')
  .description('Archive completed workflows')
  .argument('<workflow-id>', 'Workflow ID')
  .argument('<lessons-learned>', 'Lessons learned')
  .action((workflowId, lessonsLearned) => {
    try {
      outputData(orchestrator.archiveWorkflow(workflowId, lessonsLearned));
    } catch (error) {
      handleError(error);
    }
  });

program
  .command('clone-workflow')
  .description('Create workflow from existing template')
  .argument('<source-id>', 'Source workflow ID')
  .argument('<modifications>', 'Modifications to apply (JSON string)')
  .action((sourceId, modifications) => {
    try {
      const modificationsObj = JSON.parse(modifications);
      outputData(orchestrator.cloneWorkflow(sourceId, modificationsObj));
    } catch (error) {
      handleError(error);
    }
  });

// Agent Coordination Commands
program
  .command('sync-agents')
  .description('Coordinate synchronization between agents')
  .argument('<agent-list>', 'Comma-separated list of agents to synchronize')
  .argument('<topic>', 'Synchronization topic')
  .argument('<format>', 'Synchronization format')
  .action((agentList, topic, format) => {
    try {
      const agents = agentList.split(',');
      outputData(orchestrator.syncAgents(agents, topic, format));
    } catch (error) {
      handleError(error);
    }
  });

program
  .command('balance-load')
  .description('Rebalance workloads across agents')
  .argument('<agents>', 'Comma-separated list of agents')
  .argument('<criteria>', 'Balancing criteria')
  .action((agents, criteria) => {
    try {
      const agentList = agents.split(',');
      outputData(orchestrator.balanceLoad(agentList, criteria));
    } catch (error) {
      handleError(error);
    }
  });

program
  .command('handoff')
  .description('Manage clean handoffs between agents')
  .argument('<from-agent>', 'Source agent')
  .argument('<to-agent>', 'Target agent')
  .argument('<context>', 'Context to transfer (JSON string)')
  .action((fromAgent, toAgent, context) => {
    try {
      const contextObj = JSON.parse(context);
      outputData(orchestrator.handoff(fromAgent, toAgent, contextObj));
    } catch (error) {
      handleError(error);
    }
  });

program
  .command('conflict-resolution')
  .description('Facilitate resolution of agent conflicts')
  .argument('<agents>', 'Comma-separated list of agents in conflict')
  .argument('<issue>', 'Conflict issue')
  .action((agents, issue) => {
    try {
      const agentList = agents.split(',');
      outputData(orchestrator.conflictResolution(agentList, issue));
    } catch (error) {
      handleError(error);
    }
  });

program
  .command('cross-training')
  .description('Coordinate knowledge sharing between agents')
  .argument('<agents>', 'Comma-separated list of agents')
  .argument('<skills>', 'Comma-separated list of skills to share')
  .action((agents, skills) => {
    try {
      const agentList = agents.split(',');
      const skillList = skills.split(',');
      outputData(orchestrator.crossTraining(agentList, skillList));
    } catch (error) {
      handleError(error);
    }
  });

program
  .command('backup-assignment')
  .description('Set up agent backup arrangements')
  .argument('<primary-agent>', 'Primary agent')
  .argument('<backup-agent>', 'Backup agent')
  .action((primaryAgent, backupAgent) => {
    try {
      outputData(orchestrator.backupAssignment(primaryAgent, backupAgent));
    } catch (error) {
      handleError(error);
    }
  });

// Enhanced Orchestrator Commands
program
  .command('visualize')
  .description('Generate real-time visualization of workflow status')
  .argument('<workflow-id>', 'Workflow ID')
  .action((workflowId) => {
    try {
      outputData(orchestrator.visualize(workflowId));
    } catch (error) {
      handleError(error);
    }
  });

program
  .command('analyze-performance')
  .description('Analyze workflow performance and identify bottlenecks')
  .action(() => {
    try {
      outputData(orchestrator.analyzePerformance());
    } catch (error) {
      handleError(error);
    }
  });

program
  .command('predict-delivery')
  .description('Predict delivery dates based on current progress and trends')
  .option('-c, --confidence', 'Include confidence scoring in predictions')
  .argument('[workflow-id]', 'Workflow ID (optional)')
  .action((workflowId, options) => {
    try {
      outputData(orchestrator.predictDelivery(workflowId, options));
    } catch (error) {
      handleError(error);
    }
  });

// Parse command line arguments
program.parse();