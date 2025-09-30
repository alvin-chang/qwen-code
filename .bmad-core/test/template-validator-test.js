// Test script for template validator
const TemplateValidator = require('../utils/template-validator');
const fs = require('fs-extra');
const path = require('path');

async function runTests() {
  console.log('Running Template Validator Tests...\n');
  
  const validator = new TemplateValidator();
  
  // Test 1: Valid template
  console.log('Test 1: Valid template');
  try {
    const validTemplatePath = path.join(__dirname, 'test-template.yaml');
    const validResult = await validator.validateFile(validTemplatePath);
    console.log(`Result: ${validResult.isValid ? 'PASS' : 'FAIL'}`);
    if (!validResult.isValid) {
      console.log('Errors:', validResult.errors);
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
  
  console.log('\n---\n');
  
  // Test 2: Invalid template
  console.log('Test 2: Invalid template');
  try {
    const invalidTemplatePath = path.join(__dirname, 'invalid-template.yaml');
    const invalidResult = await validator.validateFile(invalidTemplatePath);
    console.log(`Result: ${invalidResult.isValid ? 'PASS' : 'FAIL'}`);
    if (!invalidResult.isValid) {
      console.log('Errors:');
      invalidResult.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. [${error.type}] ${error.message} (Path: ${error.path})`);
      });
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
  
  console.log('\n---\n');
  
  // Test 3: Non-existent file
  console.log('Test 3: Non-existent file');
  try {
    const nonExistentResult = await validator.validateFile('non-existent.yaml');
    console.log(`Result: ${nonExistentResult.isValid ? 'PASS' : 'FAIL'}`);
    if (!nonExistentResult.isValid) {
      console.log('Errors:');
      nonExistentResult.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. [${error.type}] ${error.message}`);
      });
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
  
  console.log('\n---\n');
  
  // Test 4: Invalid YAML
  console.log('Test 4: Invalid YAML');
  try {
    const invalidYaml = `
template:
  id: invalid-yaml
  name: Invalid YAML
  version: "1.0"
  output:
    format: markdown
    filename: test.md
    title: "Test Document"
    
# Invalid indentation
workflow:
  mode: interactive
    elicitation: advanced-elicitation
`;
    const yamlResult = validator.validateYaml(invalidYaml);
    console.log(`Result: ${yamlResult.isValid ? 'PASS' : 'FAIL'}`);
    if (!yamlResult.isValid) {
      console.log('Errors:');
      yamlResult.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. [${error.type}] ${error.message}`);
      });
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
  
  console.log('\nTests completed.');
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };