# BMAD™ Orchestrator API Documentation

## Overview

The BMAD™ Orchestrator is a comprehensive system for managing multi-agent workflows, coordinating agent interactions, and optimizing resource allocation. This documentation covers the core modules and their APIs.

## Core Modules

### WorkflowManager

Manages the lifecycle of workflows including creation, modification, pausing, resuming, archiving, and cloning.

#### API

- `createWorkflow(name, agents, phases)` - Create a new workflow
- `modifyWorkflow(workflowId, changes)` - Modify an existing workflow
- `pauseWorkflow(workflowId, reason)` - Pause a workflow
- `resumeWorkflow(workflowId, adjustments)` - Resume a paused workflow
- `archiveWorkflow(workflowId, lessonsLearned)` - Archive a completed workflow
- `cloneWorkflow(sourceId, modifications)` - Clone an existing workflow
- `getWorkflowVisualization(workflowId)` - Get workflow status visualization
- `getAllWorkflows()` - Get all workflows

### AgentCoordinator

Coordinates agent interactions, workload balancing, handoffs, and conflict resolution.

#### API

- `registerAgent(agentId, agentType, capabilities)` - Register an agent
- `updateAgentStatus(agentId, status)` - Update agent status
- `assignWorkload(agentId, workload)` - Assign workload to agent
- `removeWorkload(agentId, workloadId)` - Remove workload from agent
- `balanceWorkload(agentIds, criteria)` - Balance workload across agents
- `coordinateHandoff(fromAgentId, toAgentId, context)` - Coordinate handoff between agents
- `resolveConflict(agentIds, issue)` - Resolve conflict between agents
- `getAllAgents()` - Get all agents

### PerformanceMonitor

Monitors system performance, detects bottlenecks, predicts delivery timelines, and assesses risks.

#### API

- `getWorkflowMetrics()` - Get performance metrics for workflows
- `detectBottlenecks()` - Detect bottlenecks in workflows
- `predictDelivery(workflowId)` - Predict delivery timeline
- `performHealthCheck()` - Perform system health check
- `assessRisks()` - Assess risks in workflows

### ResourceManager

Manages resource allocation, optimization, and capacity planning.

#### API

- `registerResource(resourceId, type, properties)` - Register a resource
- `allocateResource(resourceId, allocatedTo)` - Allocate resource to workflow/agent
- `releaseResource(resourceId)` - Release resource
- `optimizeAllocation(constraints)` - Optimize resource allocation
- `planCapacity(upcomingWorkloads)` - Plan capacity
- `getAllResources()` - Get all resources
- `getAllocations(entityId)` - Get allocations for entity

### EscalationManager

Manages issue escalation paths and conflict resolution.

#### API

- `defineEscalationPath(issueType, path)` - Define escalation path
- `escalateIssue(issue, issueType, from)` - Escalate issue
- `resolveEscalation(escalationId, resolution)` - Resolve escalation
- `getActiveEscalations()` - Get active escalations
- `resolveConflict(agentIds, issue)` - Resolve conflict between agents

## Commands

The orchestrator provides the following commands for interaction:

1. `*help` - Show all available orchestrator commands and workflows
2. `*status` - Display current orchestration dashboard with all active workflows
3. `*agents` - List all available agents, their status, and current assignments
4. `*workflows` - Show active workflows, templates, and orchestration patterns
5. `*delegate [task] [agent-type] [context]` - Intelligently delegate tasks to appropriate agents
6. `*coordinate [agents] [objective] [timeline]` - Set up coordination between specific agents
7. `*monitor [scope] [metrics]` - Monitor performance across agents or workflows
8. `*optimize [target] [constraints]` - Optimize resource allocation or workflow efficiency
9. `*report [type] [audience] [timeframe]` - Generate orchestration reports for stakeholders
10. `*escalate [issue] [context] [urgency]` - Escalate critical issues to appropriate stakeholders

### Workflow Management

11. `*create-workflow [name] [agents] [phases]` - Design new multi-agent workflow
12. `*modify-workflow [workflow-id] [changes]` - Adjust existing workflow parameters
13. `*pause-workflow [workflow-id] [reason]` - Temporarily halt workflow execution
14. `*resume-workflow [workflow-id] [adjustments]` - Restart paused workflows
15. `*archive-workflow [workflow-id] [lessons-learned]` - Archive completed workflows
16. `*clone-workflow [source-id] [modifications]` - Create workflow from existing template

### Agent Coordination

17. `*sync-agents [agent-list] [topic] [format]` - Coordinate synchronization between agents
18. `*balance-load [agents] [criteria]` - Rebalance workloads across agents
19. `*handoff [from-agent] [to-agent] [context]` - Manage clean handoffs between agents
20. `*conflict-resolution [agents] [issue]` - Facilitate resolution of agent conflicts
21. `*cross-training [agents] [skills]` - Coordinate knowledge sharing between agents
22. `*backup-assignment [primary-agent] [backup-agent]` - Set up agent backup arrangements

## Memory Integration

The orchestrator integrates with the BMAD memory system using the following prefixes:

- `ORCH:WORKFLOW:` - Workflow-related activities
- `ORCH:AGENT:` - Agent coordination activities
- `ORCH:RESOURCE:` - Resource management activities
- `ORCH:ESCALATION:` - Escalation and conflict resolution activities

All orchestrator activities are automatically stored in the memory system with appropriate prefixes for cross-agent visibility.