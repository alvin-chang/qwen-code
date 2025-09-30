// BMAD™ Orchestrator - Jest Test File
// Copyright © 2025 BMAD™. All rights reserved.

const { BMADOrchestrator, OrchestratorCommandProcessor } = require('./index.js');

describe('BMAD Orchestrator - Basic Tests', () => {
  let orchestrator;
  let commandProcessor;

  beforeEach(() => {
    orchestrator = new BMADOrchestrator();
    commandProcessor = new OrchestratorCommandProcessor();
  });

  test('should create orchestrator and command processor instances', () => {
    expect(orchestrator).toBeInstanceOf(BMADOrchestrator);
    expect(commandProcessor).toBeInstanceOf(OrchestratorCommandProcessor);
  });

  test('should process help command', () => {
    const result = commandProcessor.processCommand('*help');
    expect(result).toHaveProperty('type');
    expect(result).toHaveProperty('content');
    expect(typeof result.content).toBe('string');
  });

  test('should process status command', () => {
    const result = commandProcessor.processCommand('*status');
    expect(result).toHaveProperty('type');
    expect(result).toHaveProperty('content');
    expect(typeof result.content).toBe('object');
  });

  test('should process agents command', () => {
    const result = commandProcessor.processCommand('*agents');
    expect(result).toHaveProperty('type');
    expect(result).toHaveProperty('content');
    expect(Array.isArray(result.content)).toBe(true);
  });

  test('should process workflows command', () => {
    const result = commandProcessor.processCommand('*workflows');
    expect(result).toHaveProperty('type');
    expect(result).toHaveProperty('content');
    expect(Array.isArray(result.content)).toBe(true);
  });
});