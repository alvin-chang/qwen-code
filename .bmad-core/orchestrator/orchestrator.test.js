// BMAD™ Orchestrator - Test File
// Copyright © 2025 BMAD™. All rights reserved.

const { BMADOrchestrator, orchestratorConfig } = require('./index');

describe('BMAD Orchestrator', () => {
  let orchestrator;

  beforeEach(() => {
    orchestrator = new BMADOrchestrator();
  });

  test('should create an instance of BMADOrchestrator', () => {
    expect(orchestrator).toBeInstanceOf(BMADOrchestrator);
  });

  test('should have the correct configuration', () => {
    expect(orchestrator.config).toEqual(orchestratorConfig);
  });

  test('should return help text', () => {
    const helpText = orchestrator.help();
    expect(typeof helpText).toBe('string');
    expect(helpText).toContain('BMAD™ Orchestrator Commands');
  });

  test('should return status', () => {
    const status = orchestrator.status();
    expect(typeof status).toBe('object');
    expect(status).toHaveProperty('timestamp');
    expect(status).toHaveProperty('summary');
  });

  test('should return agents list', () => {
    const agents = orchestrator.agents();
    expect(Array.isArray(agents)).toBe(true);
  });

  test('should return workflows list', () => {
    const workflows = orchestrator.workflows();
    expect(Array.isArray(workflows)).toBe(true);
  });
});