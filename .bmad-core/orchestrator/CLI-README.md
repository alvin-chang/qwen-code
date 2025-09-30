# BMAD™ Orchestrator CLI

The BMAD™ Orchestrator CLI provides a command-line interface for interacting with the BMAD™ Orchestrator, allowing you to manage multi-agent workflows, coordinate agent interactions, and optimize resource allocation.

## Installation

The orchestrator CLI is included as part of the BMAD™ framework. To use it, ensure you have the BMAD™ framework installed:

```bash
npm install bmad-method
```

## Usage

You can access the orchestrator CLI in two ways:

1. Using the main BMAD™ CLI:
   ```bash
   node tools/cli.js orchestrator [command]
   ```

2. Directly using the orchestrator CLI:
   ```bash
   npx bmad-orchestrator [command]
   ```

## Available Commands

### Core Commands

| Command | Description |
|---------|-------------|
| `help` | Show all available orchestrator commands and workflows |
| `status` | Display current orchestration dashboard with all active workflows |
| `agents` | List all available agents, their status, and current assignments |
| `workflows` | Show active workflows, templates, and orchestration patterns |
| `delegate <task> <agent-type> <context>` | Intelligently delegate tasks to appropriate agents |
| `coordinate <agents> <objective> <timeline>` | Set up coordination between specific agents |
| `monitor <scope> <metrics>` | Monitor performance across agents or workflows |
| `optimize <target> <constraints>` | Optimize resource allocation or workflow efficiency |
| `report <type> <audience> <timeframe>` | Generate orchestration reports for stakeholders |
| `escalate <issue> <context> <urgency>` | Escalate critical issues to appropriate stakeholders |

### Workflow Management Commands

| Command | Description |
|---------|-------------|
| `create-workflow <name> <agents> <phases>` | Design new multi-agent workflow |
| `modify-workflow <workflow-id> <changes>` | Adjust existing workflow parameters |
| `pause-workflow <workflow-id> <reason>` | Temporarily halt workflow execution |
| `resume-workflow <workflow-id> <adjustments>` | Restart paused workflows |
| `archive-workflow <workflow-id> <lessons-learned>` | Archive completed workflows |
| `clone-workflow <source-id> <modifications>` | Create workflow from existing template |

### Agent Coordination Commands

| Command | Description |
|---------|-------------|
| `sync-agents <agent-list> <topic> <format>` | Coordinate synchronization between agents |
| `balance-load <agents> <criteria>` | Rebalance workloads across agents |
| `handoff <from-agent> <to-agent> <context>` | Manage clean handoffs between agents |
| `conflict-resolution <agents> <issue>` | Facilitate resolution of agent conflicts |
| `cross-training <agents> <skills>` | Coordinate knowledge sharing between agents |
| `backup-assignment <primary-agent> <backup-agent>` | Set up agent backup arrangements |

### Enhanced Orchestrator Commands

| Command | Description |
|---------|-------------|
| `visualize <workflow-id>` | Generate real-time visualization of workflow status |
| `analyze-performance` | Analyze workflow performance and identify bottlenecks |
| `predict-delivery` | Predict delivery dates based on current progress and trends |

## Command Details

### help

Show all available orchestrator commands and workflows.

```bash
bmad-orchestrator help
```

### status

Display current orchestration dashboard with all active workflows.

```bash
bmad-orchestrator status
```

### agents

List all available agents, their status, and current assignments.

```bash
bmad-orchestrator agents
```

### workflows

Show active workflows, templates, and orchestration patterns.

```bash
bmad-orchestrator workflows
```

### delegate

Intelligently delegate tasks to appropriate agents.

```bash
bmad-orchestrator delegate "Implement user authentication" "developer" "Frontend login component"
```

### coordinate

Set up coordination between specific agents.

```bash
bmad-orchestrator coordinate "dev1,dev2,test1" "Implement and test user authentication" "2 days"
```

### monitor

Monitor performance across agents or workflows.

```bash
bmad-orchestrator monitor "health" "cpu,memory,disk"
```

### optimize

Optimize resource allocation or workflow efficiency.

```bash
bmad-orchestrator optimize "resources" '{"maxUtilization": 80}'
```

### report

Generate orchestration reports for stakeholders.

```bash
bmad-orchestrator report "performance" "management,team" "weekly"
```

### escalate

Escalate critical issues to appropriate stakeholders.

```bash
bmad-orchestrator escalate "Server down" "Production server is not responding" "high"
```

### create-workflow

Design new multi-agent workflow.

```bash
bmad-orchestrator create-workflow "E-commerce Platform" "analyst,architect,developer,tester,devops" "requirements,design,implementation,testing,deployment"
```

### modify-workflow

Adjust existing workflow parameters.

```bash
bmad-orchestrator modify-workflow "workflow-1234567890" '{"name": "Modified Workflow"}'
```

### pause-workflow

Temporarily halt workflow execution.

```bash
bmad-orchestrator pause-workflow "workflow-1234567890" "Waiting for client feedback"
```

### resume-workflow

Restart paused workflows.

```bash
bmad-orchestrator resume-workflow "workflow-1234567890" '{"status": "active"}'
```

### archive-workflow

Archive completed workflows.

```bash
bmad-orchestrator archive-workflow "workflow-1234567890" "Project completed successfully"
```

### clone-workflow

Create workflow from existing template.

```bash
bmad-orchestrator clone-workflow "workflow-1234567890" '{"name": "New Project Based on Template"}'
```

### sync-agents

Coordinate synchronization between agents.

```bash
bmad-orchestrator sync-agents "dev1,dev2,test1" "User authentication implementation" "daily-standup"
```

### balance-load

Rebalance workloads across agents.

```bash
bmad-orchestrator balance-load "dev1,dev2,dev3" "even"
```

### handoff

Manage clean handoffs between agents.

```bash
bmad-orchestrator handoff "dev1" "test1" '{"taskId": "auth-implementation", "description": "Handoff completed authentication implementation to testing"}'
```

### conflict-resolution

Facilitate resolution of agent conflicts.

```bash
bmad-orchestrator conflict-resolution "dev1,arch1" "Component design disagreement"
```

### cross-training

Coordinate knowledge sharing between agents.

```bash
bmad-orchestrator cross-training "dev1,dev2" "javascript,python"
```

### backup-assignment

Set up agent backup arrangements.

```bash
bmad-orchestrator backup-assignment "dev1" "dev2"
```

### visualize

Generate real-time visualization of workflow status using Mermaid diagrams.

```bash
bmad-orchestrator visualize "workflow-1234567890"
```

### analyze-performance

Analyze workflow performance and identify bottlenecks.

```bash
bmad-orchestrator analyze-performance
```

### predict-delivery

Predict delivery dates based on current progress and trends.

```bash
bmad-orchestrator predict-delivery
```

## Examples

### Creating and Managing a Workflow

```bash
# Create a new workflow
bmad-orchestrator create-workflow "Mobile App Development" "analyst,designer,developer,tester" "planning,design,development,testing"

# List all workflows
bmad-orchestrator workflows

# Delegate tasks to agents
bmad-orchestrator delegate "Create user interface mockups" "designer" "Mobile app UI design"
bmad-orchestrator delegate "Implement core features" "developer" "Mobile app development"

# Monitor workflow progress
bmad-orchestrator status

# Archive completed workflow
bmad-orchestrator archive-workflow "workflow-1234567890" "Mobile app successfully deployed to app stores"
```

### Coordinating Agents

```bash
# Register agents (this would typically be done by the system)
# For demonstration purposes, we'll assume agents are already registered

# Coordinate between agents
bmad-orchestrator coordinate "dev1,dev2,test1" "Implement and test authentication module" "3 days"

# Balance workload
bmad-orchestrator balance-load "dev1,dev2,dev3" "skill-based"

# Handle handoff
bmad-orchestrator handoff "dev1" "test1" '{"taskId": "auth-module", "description": "Authentication module implementation complete"}'

# Resolve conflict
bmad-orchestrator conflict-resolution "dev1,arch1" "Disagreement on database schema design"
```

### Performance Monitoring and Optimization

```bash
# Monitor system health
bmad-orchestrator monitor "health" "cpu,memory,network"

# Detect bottlenecks
bmad-orchestrator monitor "bottlenecks" ""

# Predict delivery
bmad-orchestrator monitor "predict" "workflow-1234567890"

# Assess risks
bmad-orchestrator monitor "risks" ""

# Optimize resource allocation
bmad-orchestrator optimize "resources" '{"strategy": "load-balanced"}'

# Plan capacity
bmad-orchestrator optimize "capacity" '{"workloads": ["project1", "project2", "project3"]}'

# Generate performance report
bmad-orchestrator report "performance" "management" "monthly"
```

### Escalation Management

```bash
# Escalate an issue
bmad-orchestrator escalate "Database performance degradation" "Production database responding slowly during peak hours" "high"

# Check active escalations
bmad-orchestrator monitor "escalations" ""
```

## Enhanced Orchestrator Examples

### Workflow Visualization

```bash
# Create a workflow
bmad-orchestrator create-workflow "Web Application Development" "analyst,architect,developer,tester,devops" "requirements,design,implementation,testing,deployment"

# Visualize the workflow
bmad-orchestrator visualize "workflow-1234567890"

# Update workflow and visualize again
bmad-orchestrator modify-workflow "workflow-1234567890" '{"name": "Enhanced Web Application Development"}'
bmad-orchestrator visualize "workflow-1234567890"
```

### Performance Analysis

```bash
# Analyze performance across all workflows
bmad-orchestrator analyze-performance

# Delegate tasks and analyze again
bmad-orchestrator delegate "Implement user authentication" "developer" "Frontend login component"
bmad-orchestrator analyze-performance
```

### Delivery Prediction

```bash
# Predict delivery date for current workflow status
bmad-orchestrator predict-delivery

# Add more tasks and predict again
bmad-orchestrator delegate "Implement payment processing" "developer" "Payment gateway integration"
bmad-orchestrator predict-delivery
```

## Best Practices

1. **Use descriptive names** for workflows and tasks to make them easily identifiable
2. **Monitor regularly** to catch issues early
3. **Balance workloads** to prevent agent overload
4. **Document lessons learned** when archiving workflows
5. **Use appropriate escalation paths** for different types of issues
6. **Coordinate handoffs** to maintain context between agents
7. **Generate regular reports** for stakeholders

## Troubleshooting

### Common Issues

1. **Command not found**: Ensure you're in the correct directory and that the BMAD™ framework is properly installed
2. **Permission denied**: Check file permissions and run with appropriate privileges
3. **JSON parsing errors**: Ensure JSON arguments are properly formatted with escaped quotes
4. **Agent not found**: Verify that the specified agent type exists and is available
5. **Workflow not found**: Check that the workflow ID is correct and the workflow exists

### Getting Help

If you encounter issues:

1. Use the `help` command to review available commands
2. Check the main BMAD™ documentation
3. Search community forums and support channels
4. File an issue on the GitHub repository if it's a bug

## Contributing

We welcome contributions to improve the orchestrator CLI:

1. Fork the repository
2. Make improvements to the CLI
3. Submit pull requests with enhancements
4. Share your experiences and suggestions

## License

The BMAD™ Orchestrator CLI is provided as part of the BMAD™ framework and is subject to the same license terms.