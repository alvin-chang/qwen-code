// BMAD™ Orchestrator Configuration
// Copyright © 2025 BMAD™. All rights reserved.

const orchestratorConfig = {
  // Workflow Management Settings
  workflows: {
    tracking: true,
    visualization: true,
    maxActive: 50,
    autoArchive: true,
    archiveAfterDays: 30
  },

  // Agent Coordination Settings
  agents: {
    coordination: true,
    maxWorkload: 10,
    autoBalance: true,
    communicationTimeout: 30000 // milliseconds
  },

  // Performance Monitoring Settings
  monitoring: {
    healthCheckInterval: 60000, // milliseconds
    bottleneckDetection: true,
    deliveryPrediction: true,
    analyticsCollection: true
  },

  // Cross-Agent Sharing Settings
  crossAgent: {
    sharing: true,
    syncInterval: 300000, // milliseconds (5 minutes)
    messageRetentionDays: 7
  },

  // Enhanced Features
  enhanced: {
    visualization: {
      mermaid: true,
      realtimeUpdates: true
    },
    bottleneck: {
      detection: true,
      alerting: true
    },
    delivery: {
      prediction: true,
      confidenceThreshold: 0.8
    },
    analytics: {
      performance: true,
      resource: true,
      agent: true
    }
  },

  // Memory Integration
  memory: {
    prefix: 'ORCHESTRATOR',
    crossAgentSharing: true
  }
};

module.exports = orchestratorConfig;