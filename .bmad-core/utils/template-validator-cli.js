#!/usr/bin/env node

// CLI for BMAD Template Validator
const TemplateValidator = require('./template-validator');
const fs = require('fs-extra');
const path = require('path');

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: template-validator <template-file.yaml>');
    console.log('       template-validator --help');
    process.exit(1);
  }
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('BMAD Template Validator');
    console.log('======================');
    console.log('');
    console.log('Validates BMAD YAML templates against the official schema.');
    console.log('');
    console.log('Usage:');
    console.log('  template-validator <template-file.yaml>');
    console.log('  template-validator --help');
    console.log('');
    console.log('Options:');
    console.log('  --help, -h    Show this help message');
    process.exit(0);
  }
  
  const filePath = args[0];
  
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
    const validator = new TemplateValidator();
    const result = await validator.validateFile(filePath);
    
    console.log(`Validating template: ${filePath}`);
    console.log('');
    
    if (result.isValid) {
      console.log('✅ Template validation passed successfully');
      process.exit(0);
    } else {
      console.log('❌ Template validation failed:');
      console.log('');
      
      result.errors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.type}] ${error.message}`);
        console.log(`   Path: ${error.path}`);
        console.log('');
      });
      
      // Provide suggestions for fixing errors
      const suggestions = validator.getSuggestions(result.errors);
      if (suggestions.length > 0) {
        console.log('💡 Suggestions for fixing errors:');
        suggestions.forEach((suggestion, index) => {
          console.log(`  ${index + 1}. ${suggestion}`);
        });
        console.log('');
      }
      
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Error during validation: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };