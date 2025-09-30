// BMAD™ Orchestrator - Main Entry Point
// Copyright © 2025 BMAD™. All rights reserved.

const BMADOrchestrator = require('./bmad-orchestrator');
const OrchestratorCommandProcessor = require('./command-processor');
const { initializeOrchestrator } = require('./initializer');
const orchestratorConfig = require('./config');

module.exports = {
  BMADOrchestrator,
  OrchestratorCommandProcessor,
  initializeOrchestrator,
  orchestratorConfig
};