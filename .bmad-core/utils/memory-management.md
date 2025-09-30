# Memory Management Guide

<!-- Powered by BMAD™ Core -->

This document provides comprehensive guidance on implementing and using the BMAD memory management system for maintaining context across agent interactions, project workflows, and development cycles.

## Overview

The BMAD memory system enables persistent storage and retrieval of context information at both project and agent levels, facilitating more coherent and contextually-aware AI assistance throughout the development lifecycle.

## Configuration

Memory configuration is defined in `core-config.yaml`:

```yaml
memory:
  enabled: true
  isolation:
    project: true  # Project-level memory isolation
    agent: true    # Agent-level memory isolation
  storage:
    location: .ai/memory
    format: json
  prefixes:
    analyst: ANALYSIS
    architect: ARCH
    bmad-master: BMAD
    bmad-orchestrator: ORCHESTRATOR
    dev: DEV
    devops: DEVOPS
    performance: PERFORMANCE
    pm: PM
    po: PO
    qa: QA
    security: SECURITY
    sm: SM
    technical-writer: DOC
    ux-expert: UX
  retention:
    days: 30
    maxEntries: 1000
  compression:
    enabled: true
    threshold: 100
```

## Memory Architecture

### Project-Level Memory

Project-level memory maintains context that spans across multiple agents and sessions:

- **Purpose**: Store project-wide decisions, architectural choices, and cross-agent context
- **Scope**: Accessible to all agents working on the project
- **Storage**: `.ai/memory/project/`
- **Lifecycle**: Persists throughout project development

### Agent-Level Memory

Agent-level memory maintains context specific to individual agent roles:

- **Purpose**: Store agent-specific context, learned patterns, and role-specific decisions
- **Scope**: Accessible only to the specific agent type
- **Storage**: `.ai/memory/agents/{agent-prefix}/`
- **Lifecycle**: Persists across sessions for the same agent role

## Prefix Strategy

### Standard Prefixes

Each agent type uses a specific prefix for memory entries:

| Agent Role | Prefix | Description |
|------------|--------|--------------|
| Analyst | ANALYSIS | Business analysis and requirements |
| Architect | ARCH | System architecture and design decisions |
| BMAD Master | BMAD | Core framework decisions and coordination |
| BMAD Orchestrator | ORCHESTRATOR | Workflow orchestration and task management |
| Developer | DEV | Development decisions and code patterns |
| DevOps | DEVOPS | Infrastructure and deployment decisions |
| Performance | PERFORMANCE | Performance optimization insights |
| Project Manager | PM | Project planning and coordination |
| Product Owner | PO | Product decisions and feature prioritization |
| Quality Assurance | QA | Testing strategies and quality decisions |
| Security | SECURITY | Security considerations and decisions |
| Scrum Master | SM | Process and team coordination |
| Technical Writer | DOC | Documentation decisions and content strategy |
| UX Expert | UX | User experience decisions and design patterns |

### Prefix Usage Patterns

```
{PREFIX}_{CONTEXT_TYPE}_{IDENTIFIER}

Examples:
- ARCH_DECISION_DATABASE_CHOICE
- DEV_PATTERN_ERROR_HANDLING
- QA_STRATEGY_INTEGRATION_TESTING
- DOC_STYLE_API_DOCUMENTATION
```

## Memory Operations

### Storage Commands

#### Store Project Memory
```bash
# Store project-wide decision
/memory store project ARCH_DECISION_DATABASE_CHOICE "Selected PostgreSQL for primary database due to ACID compliance requirements and JSON support for flexible schemas."

# Store architectural pattern
/memory store project ARCH_PATTERN_API_DESIGN "RESTful API with OpenAPI 3.0 specification, following resource-based URL patterns and standard HTTP status codes."
```

#### Update Existing Memory
```bash
# Update existing memory with new information
/memory update project ARCH_DECISION_DATABASE_CHOICE "Updated: Selected PostgreSQL with TimescaleDB extension for time-series data optimization."

# Update with new confidence level
/memory update agent DEV_PATTERN_ERROR_HANDLING "Revised implementation with async/await pattern for better error handling" --confidence 0.95
```

#### Delete Memory
```bash
# Remove obsolete decisions
/memory delete project ARCH_DECISION_OBSOLETE_TECHNOLOGY

# Remove outdated patterns
/memory delete agent DEV_PATTERN_DEPRECATED_FRAMEWORK
```

#### Store Agent Memory
```bash
# Store agent-specific context
/memory store agent DEV_PATTERN_ERROR_HANDLING "Implemented centralized error handling middleware with structured logging and user-friendly error responses."

# Store learned preference
/memory store agent QA_PREFERENCE_TEST_FRAMEWORK "Team prefers Jest for unit testing due to familiarity and built-in mocking capabilities."
```

### Retrieval Commands

#### Search Project Memory
```bash
# Search for specific decisions
/memory search project "database"

# Search by prefix
/memory search project "ARCH_DECISION"

# Get all architectural decisions
/memory search project "ARCH_*"
```

#### Search Agent Memory
```bash
# Search current agent's memory
/memory search agent "error handling"

# Search specific agent type
/memory search agent:DEV "pattern"

# Search across all agents (if permissions allow)
/memory search agents "testing"
```

### Management Commands

```bash
# List all memory entries
/memory list project
/memory list agent

# Clear old entries
/memory clean --older-than 30d

# Export memory for backup
/memory export --format json --output memory-backup.json

# Import memory from backup
/memory import memory-backup.json

# Update existing memory entry
/memory update project ARCH_DECISION_DATABASE_CHOICE "Updated: Selected PostgreSQL with TimescaleDB extension for time-series data optimization."

# Delete memory entry
/memory delete project ARCH_DECISION_OBSOLETE_TECHNOLOGY

# Share memory with specific agents
/memory share ARCH_DECISION_DATABASE_CHOICE --with-agents dev,qa --context "Database selection affects implementation and testing"
```

## Best Practices

### Memory Entry Guidelines

1. **Use Descriptive Keys**: Keys should clearly indicate the type and context of stored information
   ```
   Good: ARCH_DECISION_CACHING_STRATEGY
   Poor: CACHE_THING
   ```

2. **Include Rationale**: Store not just what was decided, but why
   ```
   "Selected Redis for caching due to high-performance requirements and existing team expertise. Considered Memcached but Redis's data structures better suit our use case."
   ```

3. **Timestamp Important Decisions**: Include temporal context for significant decisions
   ```
   DEV_DECISION_FRAMEWORK_UPGRADE_2024_09: "Upgraded to React 18 for concurrent features and improved performance. Migration completed successfully with minimal breaking changes."
   ```

### Storage Strategy

1. **Project Memory**: Use for decisions that affect multiple team members or system components
2. **Agent Memory**: Use for role-specific patterns, preferences, and learned behaviors
3. **Avoid Duplication**: Don't store the same information in both project and agent memory
4. **Regular Cleanup**: Remove obsolete entries to maintain relevance

### Search Optimization

1. **Use Consistent Terminology**: Standardize technical vocabulary across entries
2. **Tag Related Entries**: Use consistent prefixes and identifiers for related decisions
3. **Include Synonyms**: Add alternative terms that team members might search for

## Workflow Integration

### Development Workflow

1. **Planning Phase**:
   - Store architectural decisions as they're made
   - Record technical constraints and requirements
   - Document technology choices and rationale

2. **Implementation Phase**:
   - Store coding patterns and standards
   - Record problem solutions and workarounds
   - Document API decisions and design patterns

3. **Review Phase**:
   - Store lessons learned from code reviews
   - Record quality standards and preferences
   - Document process improvements

### Cross-Agent Coordination

```bash
# Architect stores decision
/memory store project ARCH_DECISION_API_VERSIONING "API versioning via URL path (/v1/, /v2/) for clear client migration path"

# Developer retrieves for implementation
/memory search project "API_VERSIONING"

# QA references for test planning
/memory search project "versioning"

# Documentation team uses for API docs
/memory search project "API_*"
```

## Memory Entry Examples

### Architectural Decisions
```
ARCH_DECISION_MICROSERVICES_COMMUNICATION: "Selected REST APIs for synchronous communication between services. Considered GraphQL but REST better fits team expertise and tooling ecosystem."

ARCH_PATTERN_DATABASE_DESIGN: "Implemented database-per-service pattern with event sourcing for audit trails. Each service owns its data schema and communicates via domain events."
```

### Development Patterns
```
DEV_PATTERN_STATE_MANAGEMENT: "Using Redux Toolkit for state management in React components. Provides predictable state updates and excellent debugging tools."

DEV_STANDARD_ERROR_RESPONSES: "Standardized error response format: { error: { code, message, details, timestamp } }. Enables consistent client-side error handling."
```

### Quality Assurance Guidelines
```
QA_STRATEGY_E2E_TESTING: "Cypress for end-to-end testing with page object pattern. Focuses on critical user journeys rather than comprehensive coverage."

QA_STANDARD_API_TESTING: "Postman collections for API testing with environment variables for different deployment stages. Automated via Newman in CI/CD pipeline."
```

### Documentation Standards
```
DOC_STYLE_CODE_COMMENTS: "JSDoc format for function documentation. Include parameter types, return values, and usage examples for public APIs."

DOC_PATTERN_README_STRUCTURE: "README structure: Overview, Installation, Usage Examples, API Reference, Contributing Guidelines, License."
```

## Security Considerations

1. **Sensitive Information**: Never store secrets, API keys, or passwords in memory
2. **Access Control**: Respect agent-level isolation boundaries
3. **Data Retention**: Follow retention policies to avoid accumulating sensitive historical data
4. **Audit Trail**: Memory operations should be logged for security auditing

## Troubleshooting

### Common Issues

1. **Memory Not Persisting**:
   - Check storage location permissions
   - Verify configuration is properly loaded
   - Ensure retention settings aren't too aggressive

2. **Search Not Finding Entries**:
   - Check prefix consistency
   - Verify search syntax
   - Consider synonyms and alternative terms

3. **Performance Issues**:
   - Enable compression for large memory stores
   - Implement regular cleanup procedures
   - Consider increasing maxEntries limit

### Debugging Commands

```bash
# Check memory configuration
/memory config

# Verify storage location
/memory status

# Test search functionality
/memory search project "*" --debug

# Check memory statistics
/memory stats
```

## Migration and Backup

### Backup Strategy

```bash
# Regular backup
/memory export --all --output "memory-backup-$(date +%Y%m%d).json"

# Incremental backup
/memory export --changed-since 7d --output "memory-incremental.json"
```

### Migration Procedures

1. **Project Migration**: Export from source, import to destination
2. **Schema Updates**: Use transformation scripts for format changes
3. **Agent Consolidation**: Merge agent memories when roles are combined
4. **Cleanup**: Remove obsolete entries after successful migration

## Advanced Usage

### Custom Prefixes

For specialized team roles or project-specific contexts:

```yaml
memory:
  prefixes:
    # Standard prefixes...
    data-scientist: DS
    mobile-dev: MOBILE
    integration-specialist: INTEGRATION
```

### Conditional Storage

```bash
# Store only if not exists
/memory store project ARCH_DECISION_AUTH --if-not-exists "OAuth 2.0 with PKCE for web and mobile clients"

# Update existing entry
/memory update project ARCH_DECISION_AUTH "Updated: OAuth 2.0 with PKCE and refresh token rotation for enhanced security"
```

### Memory Analytics

```bash
# Most accessed entries
/memory analytics --top-accessed 10

# Memory usage by agent
/memory analytics --usage-by-agent

# Decision timeline
/memory analytics --timeline --filter "ARCH_DECISION_*"
```

---

*This guide is part of the BMAD™ methodology. For more information on BMAD agents and workflows, see the [BMAD documentation](../docs/).*
