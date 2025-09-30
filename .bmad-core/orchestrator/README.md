# BMAD™ Orchestrator

The BMAD™ Orchestrator is a comprehensive system for managing multi-agent workflows, coordinating agent interactions, and optimizing resource allocation.

For advanced users, the Enhanced BMAD Orchestrator provides additional capabilities including workflow visualization, performance analytics, and delivery prediction.

## Features

- Workflow management (creation, modification, pausing, resuming, archiving, cloning)
- Agent coordination (synchronization, workload balancing, handoffs, conflict resolution)
- Performance monitoring and reporting
- Resource management and optimization
- Escalation management
- Memory integration with cross-agent communication
- Enhanced visualization with real-time Mermaid diagrams (Enhanced Orchestrator)
- Advanced performance analytics and insights (Enhanced Orchestrator)
- Delivery date prediction with confidence scoring (Enhanced Orchestrator)

## Installation

```bash
npm install
```

## Usage

### As a Module

```javascript
const { BMADOrchestrator } = require('./bmad-core/orchestrator');

const orchestrator = new BMADOrchestrator();
const status = orchestrator.status();
console.log(status);
```

### Command Line Interface

The orchestrator provides a comprehensive CLI with 22 distinct commands for managing workflows, agents, and resources.

```bash
node bmad-core/orchestrator/cli.js [command]
```

See [CLI Documentation](CLI-README.md) for detailed usage instructions.

### Programmatic Command Processing

```javascript
const { OrchestratorCommandProcessor } = require('./bmad-core/orchestrator');

const processor = new OrchestratorCommandProcessor();
const result = processor.processCommand('*status');
console.log(result);
```

## API

See [API.md](API.md) for detailed API documentation.

## Implementation

See [IMPLEMENTATION-SUMMARY.md](IMPLEMENTATION-SUMMARY.md) for implementation details.

## Testing

The orchestrator includes comprehensive unit tests and integration tests to ensure reliability and correctness.

### Running Tests

To run all orchestrator tests:

```bash
npm test
```

To run tests with coverage:

```bash
npm run test:coverage
```

To run specific test files:

```bash
npm test -- orchestrator.test.js
```

### Test Structure

- **Unit Tests**: Individual module functionality (`orchestrator.test.js`)
- **Integration Tests**: Cross-module interactions (`orchestrator-integration.test.js`)
- **Command Tests**: Command processing and execution (`orchestrator-commands.test.js`)
- **Memory Tests**: Memory integration and extensions (`orchestrator-memory.test.js`)
- **Cross-Module Tests**: Complex multi-module scenarios (`orchestrator-cross-module.test.js`)

### Test Coverage

The test suite provides comprehensive coverage of:
- All orchestrator commands
- Memory integration with proper prefixing
- Cross-module interactions
- Error handling and edge cases
- Performance monitoring
- Resource management
- Workflow lifecycle management