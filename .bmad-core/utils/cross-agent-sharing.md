# Cross-Agent Memory Sharing Guide

<!-- Powered by BMAD™ Core -->

This document provides comprehensive guidance on implementing and using cross-agent memory sharing in the BMAD framework.

## Overview

Cross-agent memory sharing enables different BMAD agents to exchange context and decisions, facilitating better coordination and reducing duplication of work. This mechanism allows agents to build on each other's work and maintain consistency across the development lifecycle.

## Sharing Mechanisms

### Explicit Sharing

Explicit sharing is initiated by an agent when it determines that information should be shared with other agents:

```bash
# Share architectural decision with development and QA teams
/share_memory "ARCH_DECISION_DATABASE_CHOICE" --with-agents dev,qa --context "Database selection affects implementation and testing approaches"

# Share user research findings with UX and PM teams
/share_memory "UX_RESEARCH_USER_PREFERENCES" --with-agents ux,pm --context "User preferences inform feature prioritization and design decisions"
```

### Implicit Sharing

Implicit sharing is automatically managed by the system based on relevance and relationships between agents:

```bash
# System automatically shares related memories
/auto_share_memory "DEV_CODE_AUTH_IMPLEMENTATION" --relevance-threshold 0.8
```

## Sharing Protocols

### Permission Levels

1. **Read-Only**: Agents can access but not modify shared memories
2. **Read-Write**: Agents can access and update shared memories
3. **Owner**: Full control including deletion of shared memories

### Sharing Scopes

1. **Agent-Specific**: Shared with specific agents
2. **Role-Based**: Shared with agent roles
3. **Project-Wide**: Shared across entire project
4. **Global**: Shared across all projects

## Implementation Patterns

### Coordinated Decision Making

```bash
# Architect shares decision with relevant agents
/store_memory "ARCH_DECISION_MICROSERVICES" --agent-role architect
/share_memory "ARCH_DECISION_MICROSERVICES" --with-agents dev,devops,qa

# Developer accesses shared decision
/search_memory "ARCH_DECISION_MICROSERVICES" --agent-role dev

# Developer shares implementation approach
/store_memory "DEV_PATTERN_MICROSERVICE_COMMUNICATION" --agent-role dev
/share_memory "DEV_PATTERN_MICROSERVICE_COMMUNICATION" --with-agents architect,qa
```

### Handoff Coordination

```bash
# Scrum Master prepares sprint summary
/store_memory "SM_SPRINT_SUMMARY" --agent-role sm
/share_memory "SM_SPRINT_SUMMARY" --with-agents dev,qa

# Development team accesses sprint summary
/search_memory "SM_SPRINT_SUMMARY" --agent-role dev

# Development team shares progress updates
/store_memory "DEV_PROGRESS_UPDATE" --agent-role dev
/share_memory "DEV_PROGRESS_UPDATE" --with-agents sm,qa
```

### Knowledge Transfer

```bash
# Senior Developer shares best practices
/store_memory "DEV_BEST_PRACTICES_ERROR_HANDLING" --agent-role dev
/share_memory "DEV_BEST_PRACTICES_ERROR_HANDLING" --with-agents all-devs

# Junior Developer accesses shared knowledge
/search_memory "DEV_BEST_PRACTICES*" --agent-role dev
```

## Best Practices

### Appropriate Sharing

1. **Share Useful Information**: Only share information that is relevant and useful to other agents
2. **Respect Privacy**: Ensure sensitive information is properly protected
3. **Consider Recipient Needs**: Share information in a format that is useful to the recipient

### Access Control

1. **Grant Appropriate Permissions**: Give agents the minimum permissions they need
2. **Monitor Sharing Activity**: Keep track of what is being shared and with whom
3. **Review Access Regularly**: Periodically review and update sharing permissions

### Context Provision

1. **Include Context**: When sharing memories, include context about why they're being shared
2. **Provide Usage Guidance**: Explain how shared memories should be used
3. **Link Related Memories**: Connect related memories to provide a complete picture

## Troubleshooting

### Common Issues

1. **Sharing Failures**: Check permissions and agent availability
2. **Access Denied**: Verify that the requesting agent has appropriate permissions
3. **Outdated Information**: Ensure shared memories are kept current with updates

### Debugging Commands

```bash
# Check sharing status
/memory sharing --status

# List shared memories
/memory sharing --list

# Verify access permissions
/memory sharing --permissions {memory_id}

# Audit sharing history
/memory sharing --audit
```

## Security Considerations

### Data Protection

1. **Encryption**: Ensure memories are encrypted both at rest and in transit
2. **Access Control**: Implement proper authentication and authorization
3. **Audit Trails**: Maintain logs of all sharing activities

### Compliance

1. **Regulatory Requirements**: Ensure sharing complies with data privacy laws
2. **Industry Standards**: Follow relevant industry standards for information sharing
3. **Organizational Policies**: Adhere to organizational policies for data handling

## Advanced Usage

### Conditional Sharing

```bash
# Share only if certain conditions are met
/share_memory "DEV_CODE_SECURITY_FIX" --with-agents qa --if-not-shared

# Share with different permissions based on agent role
/share_memory "ARCH_DECISION" --with-agents dev:read-write,qa:read-only
```

### Scheduled Sharing

```bash
# Schedule regular sharing of project status
/schedule sharing "PROJECT_STATUS" --with-agents all --frequency daily --time "09:00"

# Schedule sharing of sprint retrospectives
/schedule sharing "SPRINT_RETROSPECTIVE" --with-agents team --frequency weekly --day Friday
```

---

*This guide is part of the BMAD™ methodology. For more information on BMAD agents and workflows, see the [BMAD documentation](../docs/).*