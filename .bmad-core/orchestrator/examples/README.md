# BMAD™ Orchestrator Examples

This directory contains example scripts that demonstrate the capabilities of the BMAD™ Orchestrator in realistic scenarios.

## Available Examples

### 1. Working Orchestrator Demo
File: `working-orchestrator-demo.js`

This script demonstrates the orchestrator in action with mock agents, showing:
- Workflow creation and management
- Agent registration and coordination
- Task delegation
- Performance monitoring
- Resource optimization
- Reporting

To run:
```bash
node working-orchestrator-demo.js
```

### 2. Comprehensive Orchestrator Demo
File: `comprehensive-orchestrator-demo.js`

This comprehensive demo simulates a complete software development project lifecycle for an AI-powered customer support chatbot, demonstrating:
- Multi-agent collaboration
- Resource allocation and optimization
- Performance monitoring with bottleneck detection
- Delivery prediction
- Risk assessment
- Conflict resolution
- Escalation management
- Cross-agent training
- Backup assignments

To run:
```bash
node comprehensive-orchestrator-demo.js
```

### 3. CLI Test Script
File: `test-orchestrator-cli.js`

This script tests the orchestrator CLI commands to ensure they work correctly:
- Command parsing and validation
- Error handling
- JSON argument processing
- Integration with orchestrator core

To run:
```bash
node test-orchestrator-cli.js
```

## Running the Examples

### Prerequisites
- Node.js installed (version 14 or higher)
- BMAD™ framework installed

### Installation
Navigate to this directory and install dependencies:
```bash
npm install
```

### Running Examples
Use the npm scripts defined in the package.json:

1. Working demo:
   ```bash
   npm run orchestrator:demo
   ```

2. Comprehensive demo:
   ```bash
   npm run orchestrator:demo:comprehensive
   ```

3. CLI test:
   ```bash
   npm run orchestrator:cli:test
   ```

## Customization

These examples can be customized for your specific use cases:

1. Modify agent types to match your team structure
2. Adjust workflow phases to match your development process
3. Customize resource types based on your infrastructure
4. Modify escalation paths for your organization
5. Add error handling as needed for production use

## Support

For more information on using these examples or for help with customization, please refer to:
- Main BMAD™ documentation
- Orchestrator API documentation
- Community forums and support channels

## Contributing

If you have improvements or additional examples to contribute:
1. Fork the repository
2. Create a new branch for your changes
3. Add your example following the existing patterns
4. Submit a pull request with a description of your changes

We welcome contributions that enhance the learning experience for other users.