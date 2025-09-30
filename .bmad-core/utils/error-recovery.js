// Graceful Error Recovery for BMAD Template Processing
const TemplateValidator = require('./template-validator');

class ErrorRecovery {
  constructor() {
    this.validator = new TemplateValidator();
  }

  /**
   * Attempt to recover from template processing errors
   * @param {Object} error - The error that occurred
   * @param {Object} template - The template being processed
   * @param {Object} context - Processing context
   * @returns {Object} Recovery strategy and suggestions
   */
  async recoverFromError(error, template, context = {}) {
    const recoveryStrategy = {
      canRecover: false,
      strategy: 'none',
      suggestions: [],
      partialTemplate: null
    };

    // Identify the type of error
    if (error.type === 'VALIDATION_ERROR') {
      return await this.handleValidationError(error, template, context);
    } else if (error.type === 'PROCESSING_ERROR') {
      return await this.handleProcessingError(error, template, context);
    } else if (error.type === 'YAML_PARSE_ERROR') {
      return await this.handleYamlParseError(error, template, context);
    } else {
      // Generic error handling
      recoveryStrategy.suggestions = [
        'Try validating the template first using the template-validator',
        'Check that all required fields are present',
        'Ensure YAML syntax is correct',
        'Consult the BMAD template documentation'
      ];
    }

    return recoveryStrategy;
  }

  /**
   * Handle template validation errors
   * @param {Object} error - Validation error
   * @param {Object} template - The template being processed
   * @param {Object} context - Processing context
   * @returns {Object} Recovery strategy
   */
  async handleValidationError(error, template, context) {
    const recoveryStrategy = {
      canRecover: false,
      strategy: 'none',
      suggestions: [],
      partialTemplate: null
    };

    // For missing required fields, we can suggest adding them
    if (error.message.includes('Required property')) {
      const missingProperty = this.extractMissingProperty(error.message);
      
      recoveryStrategy.canRecover = true;
      recoveryStrategy.strategy = 'addMissingProperty';
      recoveryStrategy.suggestions = [
        `Add the missing "${missingProperty}" property to your template`,
        'Check the BMAD template schema documentation for required fields'
      ];
      
      // Create a partial template with the missing property
      recoveryStrategy.partialTemplate = this.addMissingProperty(template, missingProperty);
    }
    // For type errors, we can suggest converting types
    else if (error.message.includes('should be')) {
      recoveryStrategy.canRecover = true;
      recoveryStrategy.strategy = 'convertType';
      recoveryStrategy.suggestions = [
        'Check that all fields have the correct data types',
        'Ensure version is a string (e.g., "1.0" not 1.0)',
        'Ensure boolean values are true/false not "true"/"false"'
      ];
    }
    // For enum validation errors, we can suggest valid values
    else if (error.message.includes('enum')) {
      recoveryStrategy.canRecover = true;
      recoveryStrategy.strategy = 'useValidValue';
      recoveryStrategy.suggestions = [
        'Use one of the valid values for this field',
        'Check the BMAD template documentation for allowed values'
      ];
    }

    return recoveryStrategy;
  }

  /**
   * Handle template processing errors
   * @param {Object} error - Processing error
   * @param {Object} template - The template being processed
   * @param {Object} context - Processing context
   * @returns {Object} Recovery strategy
   */
  async handleProcessingError(error, template, context) {
    const recoveryStrategy = {
      canRecover: false,
      strategy: 'none',
      suggestions: [],
      partialTemplate: null
    };

    // For section processing errors, we can suggest skipping the section
    if (error.message.includes('section')) {
      recoveryStrategy.canRecover = true;
      recoveryStrategy.strategy = 'skipSection';
      recoveryStrategy.suggestions = [
        'Try skipping this section and processing the rest of the template',
        'Check the section definition for errors',
        'Ensure all required properties for this section are present'
      ];
    }
    // For instruction processing errors, we can suggest simplifying instructions
    else if (error.message.includes('instruction')) {
      recoveryStrategy.canRecover = true;
      recoveryStrategy.strategy = 'simplifyInstruction';
      recoveryStrategy.suggestions = [
        'Try simplifying the instruction for this section',
        'Break complex instructions into smaller steps',
        'Check for special characters that might need escaping'
      ];
    }

    return recoveryStrategy;
  }

  /**
   * Handle YAML parsing errors
   * @param {Object} error - YAML parse error
   * @param {Object} template - The template being processed
   * @param {Object} context - Processing context
   * @returns {Object} Recovery strategy
   */
  async handleYamlParseError(error, template, context) {
    const recoveryStrategy = {
      canRecover: false,
      strategy: 'none',
      suggestions: [],
      partialTemplate: null
    };

    recoveryStrategy.canRecover = true;
    recoveryStrategy.strategy = 'fixYamlSyntax';
    recoveryStrategy.suggestions = [
      'Check YAML indentation - use spaces, not tabs',
      'Ensure colons are followed by a space',
      'Check for unmatched brackets or quotes',
      'Validate YAML syntax using an online YAML validator'
    ];

    return recoveryStrategy;
  }

  /**
   * Extract missing property name from error message
   * @param {string} message - Error message
   * @returns {string} Missing property name
   */
  extractMissingProperty(message) {
    const match = message.match(/Required property '([^']+)'/);
    return match ? match[1] : 'unknown';
  }

  /**
   * Add missing property to template
   * @param {Object} template - Template object
   * @param {string} property - Property to add
   * @returns {Object} Template with missing property added
   */
  addMissingProperty(template, property) {
    // Create a copy of the template
    const updatedTemplate = JSON.parse(JSON.stringify(template));
    
    // Add default values for common missing properties
    if (property === 'version' && updatedTemplate.template) {
      updatedTemplate.template.version = '1.0';
    } else if (property === 'id' && updatedTemplate.template) {
      updatedTemplate.template.id = 'new-template';
    } else if (property === 'name' && updatedTemplate.template) {
      updatedTemplate.template.name = 'New Template';
    } else if (property === 'output' && updatedTemplate.template) {
      updatedTemplate.template.output = {
        format: 'markdown',
        filename: 'output.md',
        title: 'Document Title'
      };
    } else if (property === 'workflow') {
      updatedTemplate.workflow = {
        mode: 'interactive',
        elicitation: 'advanced-elicitation'
      };
    } else if (property === 'sections') {
      updatedTemplate.sections = [];
    }
    
    return updatedTemplate;
  }

  /**
   * Attempt partial template processing
   * @param {Object} template - Template to process
   * @param {Array} errorSections - Sections with errors
   * @returns {Object} Processing result
   */
  async processPartialTemplate(template, errorSections = []) {
    // Create a copy of the template without error sections
    const partialTemplate = JSON.parse(JSON.stringify(template));
    
    // Remove sections with errors
    if (partialTemplate.sections && Array.isArray(partialTemplate.sections)) {
      partialTemplate.sections = partialTemplate.sections.filter(section => 
        !errorSections.includes(section.id)
      );
    }
    
    // Try to validate the partial template
    const validationResult = this.validator.validate(partialTemplate);
    
    return {
      success: validationResult.isValid,
      partialTemplate: validationResult.isValid ? partialTemplate : null,
      errors: validationResult.errors,
      processedSections: partialTemplate.sections ? partialTemplate.sections.length : 0
    };
  }

  /**
   * Generate recovery report
   * @param {Object} recoveryStrategy - Recovery strategy
   * @returns {string} Recovery report
   */
  generateRecoveryReport(recoveryStrategy) {
    if (!recoveryStrategy.canRecover) {
      return '❌ Unable to automatically recover from this error';
    }

    let report = `✅ Recovery strategy: ${recoveryStrategy.strategy}\n\n`;
    
    if (recoveryStrategy.suggestions.length > 0) {
      report += '💡 Suggestions:\n';
      recoveryStrategy.suggestions.forEach((suggestion, index) => {
        report += `  ${index + 1}. ${suggestion}\n`;
      });
    }
    
    return report;
  }
}

module.exports = ErrorRecovery;