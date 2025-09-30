// BMAD™ Orchestrator - Initializer
// Copyright © 2025 BMAD™. All rights reserved.

const fs = require('fs-extra');
const path = require('path');

/**
 * Initialize orchestrator with default configurations
 * @param {string} projectRoot - Project root directory
 */
async function initializeOrchestrator(projectRoot) {
  try {
    // Create orchestrator directories
    const orchestratorDir = path.join(projectRoot, 'bmad-core', 'orchestrator');
    const memoryDir = path.join(projectRoot, '.ai', 'memory');
    const commsDir = path.join(memoryDir, 'communications');
    const workflowsDir = path.join(memoryDir, 'workflows');
    
    await fs.ensureDir(orchestratorDir);
    await fs.ensureDir(commsDir);
    await fs.ensureDir(workflowsDir);
    
    // Create default configuration if it doesn't exist
    const configPath = path.join(projectRoot, '.bmad-core', 'core-config.yaml');
    const configExists = await fs.pathExists(configPath);
    
    if (!configExists) {
      const defaultConfig = `# BMAD™ Core Configuration
markdownExploder: true
qa:
  qaLocation: docs/qa
prd:
  prdFile: docs/prd.md
  prdVersion: v4
  prdSharded: true
  prdShardedLocation: docs/prd
  epicFilePattern: epic-{n}*.md
architecture:
  architectureFile: docs/architecture.md
  architectureVersion: v4
  architectureSharded: true
  architectureShardedLocation: docs/architecture
customTechnicalDocuments: null
devLoadAlwaysFiles:
  - docs/architecture/coding-standards.md
  - docs/architecture/tech-stack.md
  - docs/architecture/source-tree.md
devDebugLog: .ai/debug-log.md
devStoryLocation: docs/stories
slashPrefix: BMad

# Memory Integration Configuration
memory:
  enabled: true
  isolation:
    project: true
    agent: true
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
  # Orchestrator settings
  orchestrator:
    workflow_tracking: true
    agent_communication: true
    performance_monitoring: true
    cross_agent_sharing: true
    communications_storage_days: 7
`;
      
      await fs.writeFile(configPath, defaultConfig);
    }
    
    console.log('Orchestrator initialized successfully');
  } catch (error) {
    throw new Error(`Failed to initialize orchestrator: ${error.message}`);
  }
}

module.exports = { initializeOrchestrator };