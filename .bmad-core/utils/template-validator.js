// Template Validation Engine for BMAD Method
const Ajv = require('ajv');
const yaml = require('js-yaml');
const fs = require('fs-extra');
const path = require('path');

class TemplateValidator {
  constructor() {
    this.ajv = new Ajv({ allErrors: true, verbose: true });
    this.schema = null;
    this.loadSchema();
  }

  /**
   * Load the JSON schema for template validation
   */
  loadSchema() {
    try {
      const schemaPath = path.join(__dirname, 'template-schema.json');
      this.schema = fs.readJsonSync(schemaPath);
      this.ajv.addSchema(this.schema, 'template-schema');
    } catch (error) {
      throw new Error(`Failed to load template schema: ${error.message}`);
    }
  }

  /**
   * Validate a template object against the schema
   * @param {Object} template - The template object to validate
   * @returns {Object} Validation result with isValid flag and errors if any
   */
  validate(template) {
    if (!this.schema) {
      throw new Error('Schema not loaded');
    }

    const validate = this.ajv.getSchema('template-schema');
    const isValid = validate(template);
    
    return {
      isValid,
      errors: isValid ? [] : this.formatErrors(validate.errors),
      template
    };
  }

  /**
   * Validate a template from a YAML string
   * @param {string} yamlString - The YAML string to validate
   * @returns {Object} Validation result with isValid flag and errors if any
   */
  validateYaml(yamlString) {
    try {
      const template = yaml.load(yamlString);
      return this.validate(template);
    } catch (error) {
      return {
        isValid: false,
        errors: [{
          type: 'YAML_PARSE_ERROR',
          message: `Invalid YAML syntax: ${error.message}`,
          path: 'root'
        }],
        template: null
      };
    }
  }

  /**
   * Validate a template from a file
   * @param {string} filePath - Path to the template file
   * @returns {Object} Validation result with isValid flag and errors if any
   */
  async validateFile(filePath) {
    try {
      const yamlString = await fs.readFile(filePath, 'utf8');
      return this.validateYaml(yamlString);
    } catch (error) {
      return {
        isValid: false,
        errors: [{
          type: 'FILE_ERROR',
          message: `Failed to read template file: ${error.message}`,
          path: 'root'
        }],
        template: null
      };
    }
  }

  /**
   * Format AJV errors into a more user-friendly format
   * @param {Array} errors - AJV validation errors
   * @returns {Array} Formatted errors
   */
  formatErrors(errors) {
    if (!errors || errors.length === 0) {
      return [];
    }

    return errors.map(error => {
      // Extract the path to the error
      let errorPath = 'root';
      if (error.instancePath) {
        errorPath = error.instancePath.replace(/^\//, '').replace(/\//g, '.');
      }

      // Create a user-friendly error message
      let message = error.message;
      if (error.keyword === 'required') {
        message = `Required property '${error.params.missingProperty}' is missing`;
      } else if (error.keyword === 'enum') {
        message = `Value must be one of: ${error.params.allowedValues.join(', ')}`;
      } else if (error.keyword === 'pattern') {
        message = `Value does not match required pattern`;
      }

      return {
        type: error.keyword.toUpperCase(),
        message: message,
        path: errorPath,
        schemaPath: error.schemaPath
      };
    });
  }

  /**
   * Generate a validation report
   * @param {Object} validationResult - The validation result
   * @returns {string} Formatted validation report
   */
  generateReport(validationResult) {
    if (validationResult.isValid) {
      return '✅ Template validation passed successfully';
    }

    let report = '❌ Template validation failed:\n\n';
    
    validationResult.errors.forEach((error, index) => {
      report += `${index + 1}. [${error.type}] ${error.message}
`;
      report += `   Path: ${error.path}

`;
    });

    return report;
  }

  /**
   * Get suggestions for fixing common errors
   * @param {Array} errors - Validation errors
   * @returns {Array} Suggestions for fixing errors
   */
  getSuggestions(errors) {
    const suggestions = [];
    
    errors.forEach(error => {
      switch (error.type) {
        case 'REQUIRED':
          if (error.message.includes('template')) {
            suggestions.push('Add a "template" section with id, name, version, and output properties');
          } else if (error.message.includes('workflow')) {
            suggestions.push('Add a "workflow" section with mode and elicitation properties');
          } else if (error.message.includes('sections')) {
            suggestions.push('Add a "sections" array with at least one section');
          } else if (error.message.includes('id')) {
            suggestions.push('Add an "id" property with a lowercase alphanumeric value (hyphens allowed)');
          } else if (error.message.includes('title')) {
            suggestions.push('Add a "title" property with a non-empty string value');
          } else if (error.message.includes('instruction')) {
            suggestions.push('Add an "instruction" property with detailed guidance for the LLM');
          }
          break;
          
        case 'ENUM':
          if (error.message.includes('mode')) {
            suggestions.push('Set workflow mode to either "interactive" or "yolo"');
          } else if (error.message.includes('format')) {
            suggestions.push('Set output format to "markdown"');
          }
          break;
          
        case 'PATTERN':
          if (error.path.includes('id')) {
            suggestions.push('Ensure id contains only lowercase letters, numbers, and hyphens');
          }
          break;
          
        case 'YAML_PARSE_ERROR':
          suggestions.push('Check YAML syntax for proper indentation and formatting');
          break;
      }
    });
    
    return [...new Set(suggestions)]; // Remove duplicates
  }
}

module.exports = TemplateValidator;