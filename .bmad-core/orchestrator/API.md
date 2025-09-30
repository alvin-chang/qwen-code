# BMAD™ Orchestrator API Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Core Classes](#core-classes)
5. [API Reference](#api-reference)
6. [Examples](#examples)

## Introduction

The BMAD™ Orchestrator is a sophisticated multi-agent system coordinator designed to manage complex workflows and facilitate seamless collaboration between different types of agents in the BMAD ecosystem.

## Installation

The orchestrator is part of the BMAD-METHOD package and doesn't require separate installation.

```bash
npm install bmad-method
```

## Configuration

The orchestrator can be configured through the `config.js` file:

```javascript
const orchestratorConfig = {
  core: {
    enabled: true,
    version: '2.1.0',
    name: 'BMAD Orchestrator',
    type: 'orchestrator'
  },
  // ... other configuration options
};

module.exports = orchestratorConfig;
```

## Core Classes

### BMADOrchestrator

The main orchestrator class that manages workflows, agents, and coordination.

#### Constructor

```javascript
const orchestrator = new BMADOrchestrator(config);
```

#### Properties

- `config`: The configuration object
- `workflowManager`: Manages workflows
- `agentCoordinator`: Coordinates agents
- `performanceMonitor`: Monitors performance
- `resourceManager`: Manages resources
- `escalationManager`: Handles escalations

### EnhancedOrchestrator (Extended BMADOrchestrator)

The enhanced orchestrator class that extends BMADOrchestrator with visualization, analytics, and prediction capabilities.

#### Constructor

```javascript
const enhancedOrchestrator = new EnhancedOrchestrator(config);
```

#### Additional Properties

- `mermaidGenerator`: Generates Mermaid diagrams
- `analyticsEngine`: Performance analytics engine
- `predictionEngine`: Delivery prediction engine

## API Reference

### Core Methods

#### help()
Returns help text with all available commands.

#### status()
Returns current orchestration dashboard with all active workflows.

#### agents()
Returns list of all available agents, their status, and current assignments.

#### workflows()
Returns list of active workflows, templates, and orchestration patterns.

#### delegate(task, agentType, context)
Intelligently delegates tasks to appropriate agents.

#### coordinate(agentList, objective, timeline)
Sets up coordination between specific agents.

#### monitor(scope, metrics)
Monitors performance across agents or workflows.

#### optimize(target, constraints)
Optimizes resource allocation or workflow efficiency.

#### report(type, audience, timeframe)
Generates orchestration reports for stakeholders.

#### escalate(issue, context, urgency)
Escalates critical issues to appropriate stakeholders.

### Workflow Management Methods

#### createWorkflow(name, agents, phases)
Designs new multi-agent workflow.

#### modifyWorkflow(workflowId, changes)
Adjusts existing workflow parameters.

#### pauseWorkflow(workflowId, reason)
Temporarily halts workflow execution.

#### resumeWorkflow(workflowId, adjustments)
Restarts paused workflows.

#### archiveWorkflow(workflowId, lessonsLearned)
Archives completed workflows.

#### cloneWorkflow(sourceId, modifications)
Creates workflow from existing template.

### Agent Coordination Methods

#### syncAgents(agentList, topic, format)
Coordinates synchronization between agents.

#### balanceLoad(agents, criteria)
Rebalances workloads across agents.

#### handoff(fromAgent, toAgent, context)
Manages clean handoffs between agents.

#### conflictResolution(agents, issue)
Facilitates resolution of agent conflicts.

#### crossTraining(agents, skills)
Coordinates knowledge sharing between agents.

#### backupAssignment(primaryAgent, backupAgent)
Sets up agent backup arrangements.

### Enhanced Orchestrator Methods

#### visualize(workflowId)
Generate real-time visualization of workflow status.

#### analyzePerformance()
Analyze workflow performance and identify bottlenecks.

#### predictDelivery()
Predict delivery dates based on current progress and trends.

#### generateWorkflowDiagram(workflowId)
Generate a Mermaid diagram for a specific workflow.

#### generateAgentStatusDiagram()
Generate a Mermaid diagram showing agent statuses.

#### generateResourceAllocationDiagram()
Generate a Mermaid diagram showing resource allocation.

#### getPerformanceMetrics()
Get detailed performance metrics for all workflows and agents.

#### getDeliveryPrediction()
Get delivery date prediction with confidence scoring.

## Examples

## Examples

### Basic Usage

```javascript
const { BMADOrchestrator } = require('bmad-method/bmad-core/orchestrator');

// Create orchestrator instance
const orchestrator = new BMADOrchestrator();

// Get help
console.log(orchestrator.help());

// Check status
const status = orchestrator.status();
console.log('Current status:', status);

// List agents
const agents = orchestrator.agents();
console.log('Available agents:', agents);
```

### Creating a Workflow

```javascript
// Create a new workflow
const result = orchestrator.createWorkflow(
  'Development Pipeline',
  ['developer', 'qa', 'architect'],
  [
    { name: 'Design', duration: '2d' },
    { name: 'Implementation', duration: '5d' },
    { name: 'Testing', duration: '3d' }
  ]
);

console.log('Workflow created:', result);
```

### Delegating a Task

```javascript
// Delegate a task to an agent
const result = orchestrator.delegate(
  'Implement user authentication',
  'developer',
  'Based on the architecture document'
);

console.log('Task delegated:', result);
```

### Enhanced Orchestrator Usage

```javascript
const { EnhancedOrchestrator } = require('bmad-method/bmad-core/orchestrator');

// Create enhanced orchestrator instance
const enhancedOrchestrator = new EnhancedOrchestrator();

// Create a workflow
const workflowResult = enhancedOrchestrator.createWorkflow(
  'Web Application Development',
  ['analyst', 'architect', 'developer', 'tester', 'devops'],
  ['requirements', 'design', 'implementation', 'testing', 'deployment']
);

// Visualize the workflow
const diagram = enhancedOrchestrator.visualize(workflowResult.workflowId);
console.log('Workflow visualization:', diagram);

// Analyze performance
const performance = enhancedOrchestrator.analyzePerformance();
console.log('Performance analysis:', performance);

// Predict delivery
const prediction = enhancedOrchestrator.predictDelivery();
console.log('Delivery prediction:', prediction);
```

### Workflow Visualization

```javascript
// Generate different types of diagrams
const workflowDiagram = enhancedOrchestrator.generateWorkflowDiagram('workflow-1234567890');
const agentDiagram = enhancedOrchestrator.generateAgentStatusDiagram();
const resourceDiagram = enhancedOrchestrator.generateResourceAllocationDiagram();

console.log('Workflow diagram:', workflowDiagram);
console.log('Agent diagram:', agentDiagram);
console.log('Resource diagram:', resourceDiagram);
```

## License

Copyright © 2025 BMAD™. All rights reserved.