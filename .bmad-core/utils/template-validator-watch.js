#!/usr/bin/env node

// CLI for BMAD Template Real-time Validation Feedback
const fs = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');
const ValidationFeedback = require('./validation-feedback');

class RealTimeValidator {
  constructor() {
    this.validator = new ValidationFeedback();
    this.watcher = null;
  }

  /**
   * Watch a template file for changes and provide real-time validation feedback
   * @param {string} filePath - Path to the template file
   * @param {Object} options - Watch options
   */
  async watchFile(filePath, options = {}) {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Error: File not found: ${filePath}`);
      process.exit(1);
    }

    // Check if file has .yaml extension
    if (!filePath.endsWith('.yaml') && !filePath.endsWith('.yml')) {
      console.error(`❌ Error: File must have .yaml or .yml extension`);
      process.exit(1);
    }

    console.log(`🔍 Watching template file: ${filePath}`);
    console.log('Press Ctrl+C to stop watching\n');

    // Initial validation
    await this.validateFile(filePath);

    // Watch for changes
    this.watcher = chokidar.watch(filePath, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    });

    this.watcher
      .on('change', async (changedPath) => {
        console.log(`\n🔄 File changed: ${changedPath}`);
        await this.validateFile(changedPath);
      })
      .on('error', (error) => {
        console.error(`❌ Watcher error: ${error.message}`);
      });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n👋 Stopping watcher...');
      if (this.watcher) {
        this.watcher.close();
      }
      process.exit(0);
    });
  }

  /**
   * Validate a template file
   * @param {string} filePath - Path to the template file
   */
  async validateFile(filePath) {
    try {
      const yamlContent = await fs.readFile(filePath, 'utf8');
      const result = await this.validator.validateRealTime(yamlContent);
      
      if (result.isValid) {
        console.log('✅ Template validation passed successfully');
      } else {
        console.log('⚠️ Template validation issues found:');
        result.feedback.split('\n').forEach(line => {
          if (line.trim()) {
            console.log(`  ${line}`);
          }
        });
        
        if (result.suggestions.length > 0) {
          console.log('\n💡 Suggestions for fixing issues:');
          result.suggestions.forEach((suggestion, index) => {
            console.log(`  ${index + 1}. ${suggestion}`);
          });
        }
      }
    } catch (error) {
      console.error(`❌ Error during validation: ${error.message}`);
    }
  }

  /**
   * Stop watching files
   */
  stopWatching() {
    if (this.watcher) {
      this.watcher.close();
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: template-validator-watch <template-file.yaml>');
    console.log('       template-validator-watch --help');
    process.exit(1);
  }
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('BMAD Template Real-time Validator');
    console.log('=================================');
    console.log('');
    console.log('Watches BMAD YAML templates and provides real-time validation feedback.');
    console.log('');
    console.log('Usage:');
    console.log('  template-validator-watch <template-file.yaml>');
    console.log('  template-validator-watch --help');
    console.log('');
    console.log('Options:');
    console.log('  --help, -h    Show this help message');
    process.exit(0);
  }
  
  const filePath = args[0];
  const validator = new RealTimeValidator();
  
  try {
    await validator.watchFile(filePath);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { RealTimeValidator, main };