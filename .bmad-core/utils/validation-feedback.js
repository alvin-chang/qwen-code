// Real-time Template Validation Feedback System
const TemplateValidator = require('./template-validator');

class ValidationFeedback {
  constructor() {
    this.validator = new TemplateValidator();
    this.validationMarkers = new Map(); // Store validation markers for real-time feedback
  }

  /**
   * Validate template content in real-time and provide feedback
   * @param {string} yamlContent - The YAML content to validate
   * @param {Object} editor - Editor instance (if available)
   * @returns {Object} Validation feedback with markers and suggestions
   */
  async validateRealTime(yamlContent, editor = null) {
    try {
      // Parse and validate the YAML content
      const result = this.validator.validateYaml(yamlContent);
      
      // Generate feedback markers for the editor
      const markers = this.generateMarkers(result.errors);
      
      // Store markers for later reference
      this.validationMarkers.set('current', markers);
      
      // Generate user-friendly feedback
      const feedback = this.generateFeedback(result, markers);
      
      // If editor is available, apply markers directly
      if (editor && typeof editor.applyMarkers === 'function') {
        editor.applyMarkers(markers);
      }
      
      return {
        isValid: result.isValid,
        markers,
        feedback,
        suggestions: this.validator.getSuggestions(result.errors)
      };
    } catch (error) {
      return {
        isValid: false,
        markers: [],
        feedback: `Validation error: ${error.message}`,
        suggestions: [`Check YAML syntax: ${error.message}`]
      };
    }
  }

  /**
   * Generate editor markers from validation errors
   * @param {Array} errors - Validation errors
   * @returns {Array} Editor markers
   */
  generateMarkers(errors) {
    if (!errors || errors.length === 0) {
      return [];
    }

    return errors.map((error, index) => {
      // Extract line number from error path if possible
      let line = 0;
      if (error.path) {
        // Simple path to line mapping (in a real implementation, this would be more sophisticated)
        const pathParts = error.path.split('.');
        line = Math.min(index + 1, 100); // Simple line calculation
      }

      return {
        id: `validation-${index}`,
        type: this.getMarkerType(error.type),
        line: line,
        message: error.message,
        severity: this.getSeverity(error.type)
      };
    });
  }

  /**
   * Get marker type based on error type
   * @param {string} errorType - The error type
   * @returns {string} Marker type
   */
  getMarkerType(errorType) {
    const typeMap = {
      'REQUIRED': 'error',
      'TYPE': 'error',
      'ENUM': 'warning',
      'PATTERN': 'warning',
      'YAML_PARSE_ERROR': 'error',
      'FILE_ERROR': 'error'
    };
    
    return typeMap[errorType] || 'info';
  }

  /**
   * Get severity level based on error type
   * @param {string} errorType - The error type
   * @returns {string} Severity level
   */
  getSeverity(errorType) {
    const severityMap = {
      'REQUIRED': 'error',
      'TYPE': 'error',
      'ENUM': 'warning',
      'PATTERN': 'warning',
      'YAML_PARSE_ERROR': 'error',
      'FILE_ERROR': 'error'
    };
    
    return severityMap[errorType] || 'info';
  }

  /**
   * Generate user-friendly feedback from validation result
   * @param {Object} validationResult - The validation result
   * @param {Array} markers - Validation markers
   * @returns {string} User-friendly feedback
   */
  generateFeedback(validationResult, markers) {
    if (validationResult.isValid) {
      return '✅ Template validation passed successfully';
    }

    let feedback = '⚠️ Template validation issues found:\n\n';
    
    validationResult.errors.forEach((error, index) => {
      const marker = markers[index] || {};
      const lineInfo = marker.line ? ` (line ${marker.line})` : '';
      
      feedback += `${index + 1}. ${error.message}${lineInfo}\n`;
    });

    return feedback;
  }

  /**
   * Clear validation markers
   * @param {Object} editor - Editor instance (if available)
   */
  clearMarkers(editor = null) {
    this.validationMarkers.clear();
    
    if (editor && typeof editor.clearMarkers === 'function') {
      editor.clearMarkers();
    }
  }

  /**
   * Get current validation markers
   * @returns {Array} Current validation markers
   */
  getCurrentMarkers() {
    return this.validationMarkers.get('current') || [];
  }

  /**
   * Provide auto-fix suggestions for common errors
   * @param {Array} errors - Validation errors
   * @returns {Array} Auto-fix suggestions
   */
  getAutoFixSuggestions(errors) {
    const suggestions = [];
    
    errors.forEach(error => {
      switch (error.type) {
        case 'REQUIRED':
          if (error.path.includes('template.id')) {
            suggestions.push({
              action: 'addProperty',
              path: 'template',
              property: 'id',
              value: 'your-template-id',
              description: 'Add a template ID (lowercase alphanumeric with hyphens)'
            });
          } else if (error.path.includes('template.version')) {
            suggestions.push({
              action: 'addProperty',
              path: 'template',
              property: 'version',
              value: '"1.0"',
              description: 'Add a template version (string format)'
            });
          }
          break;
          
        case 'TYPE':
          if (error.path.includes('template.version') && error.message.includes('string')) {
            suggestions.push({
              action: 'convertToString',
              path: 'template.version',
              description: 'Convert version to string format (wrap in quotes)'
            });
          }
          break;
      }
    });
    
    return suggestions;
  }
}

module.exports = ValidationFeedback;