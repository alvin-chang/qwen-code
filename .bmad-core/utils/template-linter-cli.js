#!/usr/bin/env node

// CLI for BMAD Template Linter
const TemplateLinter = require('./template-linter');
const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

class TemplateLinterCLI {
  constructor() {
    this.linter = new TemplateLinter();
  }

  /**
   * Lint a template file
   * @param {string} filePath - Path to the template file
   */
  async lintFile(filePath) {
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

    try {
      const yamlString = await fs.readFile(filePath, 'utf8');
      const template = yaml.load(yamlString);
      
      console.log(`Linting template: ${filePath}\n`);
      
      const result = this.linter.lint(template);
      const report = this.linter.generateReport(result);
      
      console.log(report);
      
      if (!result.isValid) {
        process.exit(1);
      }
      
      process.exit(0);
    } catch (error) {
      console.error(`❌ Error during linting: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Lint multiple template files
   * @param {Array} filePaths - Array of file paths
   */
  async lintFiles(filePaths) {
    let totalIssues = 0;
    let filesWithIssues = 0;
    
    for (const filePath of filePaths) {
      try {
        const yamlString = await fs.readFile(filePath, 'utf8');
        const template = yaml.load(yamlString);
        
        const result = this.linter.lint(template);
        totalIssues += result.issues.length;
        
        if (result.issues.length > 0) {
          filesWithIssues++;
          console.log(`\n${filePath}:`);
          const report = this.linter.generateReport(result);
          console.log(report);
        }
      } catch (error) {
        console.error(`❌ Error linting ${filePath}: ${error.message}`);
        totalIssues += 1;
        filesWithIssues++;
      }
    }
    
    console.log(`\n📊 Summary: ${filesWithIssues} files with issues out of ${filePaths.length} files (${totalIssues} total issues)`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: template-linter <template-file.yaml>');
    console.log('       template-linter <template-file1.yaml> <template-file2.yaml> ...');
    console.log('       template-linter --help');
    process.exit(1);
  }
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('BMAD Template Linter');
    console.log('====================');
    console.log('');
    console.log('Lints BMAD YAML templates for best practices and potential issues.');
    console.log('');
    console.log('Usage:');
    console.log('  template-linter <template-file.yaml>');
    console.log('  template-linter <template-file1.yaml> <template-file2.yaml> ...');
    console.log('  template-linter --help');
    console.log('');
    console.log('Options:');
    console.log('  --help, -h    Show this help message');
    process.exit(0);
  }
  
  const cli = new TemplateLinterCLI();
  
  if (args.length === 1) {
    await cli.lintFile(args[0]);
  } else {
    await cli.lintFiles(args);
  }
}

if (require.main === module) {
  main();
}

module.exports = { TemplateLinterCLI, main };