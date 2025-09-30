// Template Linting for BMAD Method
const TemplateValidator = require('./template-validator');

class TemplateLinter {
  constructor() {
    this.validator = new TemplateValidator();
  }

  /**
   * Lint a template for best practices and potential issues
   * @param {Object} template - The template to lint
   * @returns {Object} Linting results
   */
  lint(template) {
    const issues = [];
    
    // Run basic validation first
    const validationResult = this.validator.validate(template);
    if (!validationResult.isValid) {
      // If template is invalid, we can't meaningfully lint it
      return {
        isValid: false,
        issues: validationResult.errors.map(error => ({
          type: 'validation',
          severity: 'error',
          message: error.message,
          path: error.path
        })),
        score: 0
      };
    }
    
    // Run linting checks
    this.checkNamingConventions(template, issues);
    this.checkStructure(template, issues);
    this.checkContent(template, issues);
    this.checkPerformance(template, issues);
    this.checkDeprecated(template, issues);
    
    // Calculate linting score (0-100)
    const score = this.calculateScore(issues);
    
    return {
      isValid: issues.filter(issue => issue.severity === 'error').length === 0,
      issues,
      score
    };
  }

  /**
   * Check naming conventions
   * @param {Object} template - The template to check
   * @param {Array} issues - Issues array to populate
   */
  checkNamingConventions(template, issues) {
    // Check template ID naming convention
    if (template.template && template.template.id) {
      if (!/^[a-z0-9-]+$/.test(template.template.id)) {
        issues.push({
          type: 'naming',
          severity: 'warning',
          message: 'Template ID should use lowercase letters, numbers, and hyphens only',
          path: 'template.id',
          suggestion: 'Use kebab-case for template IDs'
        });
      }
    }
    
    // Check section ID naming convention
    if (template.sections && Array.isArray(template.sections)) {
      template.sections.forEach((section, index) => {
        if (section.id && !/^[a-z0-9-]+$/.test(section.id)) {
          issues.push({
            type: 'naming',
            severity: 'warning',
            message: `Section ID should use lowercase letters, numbers, and hyphens only`,
            path: `sections[${index}].id`,
            suggestion: 'Use kebab-case for section IDs'
          });
        }
      });
    }
  }

  /**
   * Check template structure
   * @param {Object} template - The template to check
   * @param {Array} issues - Issues array to populate
   */
  checkStructure(template, issues) {
    // Check for excessive nesting
    if (template.sections && Array.isArray(template.sections)) {
      template.sections.forEach((section, index) => {
        const nestingLevel = this.calculateNestingLevel(section, 0);
        if (nestingLevel > 5) {
          issues.push({
            type: 'structure',
            severity: 'warning',
            message: `Section has excessive nesting level (${nestingLevel}), consider flattening structure`,
            path: `sections[${index}]`,
            suggestion: 'Deeply nested sections can be difficult to maintain'
          });
        }
      });
    }
    
    // Check for sections without instructions
    if (template.sections && Array.isArray(template.sections)) {
      template.sections.forEach((section, index) => {
        if (!section.instruction) {
          issues.push({
            type: 'structure',
            severity: 'warning',
            message: 'Section is missing instruction field',
            path: `sections[${index}].instruction`,
            suggestion: 'Add clear instructions for LLM on how to handle this section'
          });
        }
      });
    }
  }

  /**
   * Check content quality
   * @param {Object} template - The template to check
   * @param {Array} issues - Issues array to populate
   */
  checkContent(template, issues) {
    // Check for very short instructions
    if (template.sections && Array.isArray(template.sections)) {
      template.sections.forEach((section, index) => {
        if (section.instruction && section.instruction.length < 20) {
          issues.push({
            type: 'content',
            severity: 'info',
            message: 'Instruction may be too brief to provide adequate guidance',
            path: `sections[${index}].instruction`,
            suggestion: 'Consider expanding instructions to provide more detailed guidance'
          });
        }
      });
    }
    
    // Check for sections with elicit=true but no meaningful content
    if (template.sections && Array.isArray(template.sections)) {
      template.sections.forEach((section, index) => {
        if (section.elicit && (!section.instruction || section.instruction.length < 50)) {
          issues.push({
            type: 'content',
            severity: 'warning',
            message: 'Elicit section has very brief instruction, may not provide enough context',
            path: `sections[${index}].instruction`,
            suggestion: 'Elicit sections should provide detailed context for user interaction'
          });
        }
      });
    }
  }

  /**
   * Check for performance anti-patterns
   * @param {Object} template - The template to check
   * @param {Array} issues - Issues array to populate
   */
  checkPerformance(template, issues) {
    // Check for excessive repeatable sections
    if (template.sections && Array.isArray(template.sections)) {
      const repeatableCount = template.sections.filter(section => section.repeatable).length;
      if (repeatableCount > 10) {
        issues.push({
          type: 'performance',
          severity: 'warning',
          message: `Template has ${repeatableCount} repeatable sections, which may impact performance`,
          path: 'sections',
          suggestion: 'Consider if all sections need to be repeatable'
        });
      }
    }
    
    // Check for sections with both repeatable and elicit set to true
    if (template.sections && Array.isArray(template.sections)) {
      template.sections.forEach((section, index) => {
        if (section.repeatable && section.elicit) {
          issues.push({
            type: 'performance',
            severity: 'info',
            message: 'Section is both repeatable and elicit, which may complicate user interaction',
            path: `sections[${index}]`,
            suggestion: 'Consider if both repeatable and elicit are needed'
          });
        }
      });
    }
  }

  /**
   * Check for deprecated features
   * @param {Object} template - The template to check
   * @param {Array} issues - Issues array to populate
   */
  checkDeprecated(template, issues) {
    // Check for deprecated fields (this is a placeholder for future use)
    // In a real implementation, this would check for deprecated template features
  }

  /**
   * Calculate nesting level of a section
   * @param {Object} section - The section to check
   * @param {number} currentLevel - Current nesting level
   * @returns {number} Maximum nesting level
   */
  calculateNestingLevel(section, currentLevel) {
    if (!section.sections || !Array.isArray(section.sections)) {
      return currentLevel;
    }
    
    let maxLevel = currentLevel;
    section.sections.forEach(childSection => {
      const childLevel = this.calculateNestingLevel(childSection, currentLevel + 1);
      maxLevel = Math.max(maxLevel, childLevel);
    });
    
    return maxLevel;
  }

  /**
   * Calculate linting score
   * @param {Array} issues - Linting issues
   * @returns {number} Score from 0-100
   */
  calculateScore(issues) {
    // Start with a perfect score
    let score = 100;
    
    // Deduct points for issues
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'error':
          score -= 10;
          break;
        case 'warning':
          score -= 5;
          break;
        case 'info':
          score -= 2;
          break;
      }
    });
    
    // Ensure score doesn't go below 0
    return Math.max(0, score);
  }

  /**
   * Generate linting report
   * @param {Object} lintResult - Linting result
   * @returns {string} Formatted linting report
   */
  generateReport(lintResult) {
    if (lintResult.issues.length === 0) {
      return `✅ Template linting passed successfully (Score: ${lintResult.score}/100)`;
    }

    let report = `⚠️ Template linting issues found (Score: ${lintResult.score}/100):\n\n`;
    
    // Group issues by severity
    const errors = lintResult.issues.filter(issue => issue.severity === 'error');
    const warnings = lintResult.issues.filter(issue => issue.severity === 'warning');
    const info = lintResult.issues.filter(issue => issue.severity === 'info');
    
    if (errors.length > 0) {
      report += '❌ Errors:\n';
      errors.forEach((issue, index) => {
        report += `  ${index + 1}. ${issue.message}\n`;
        report += `     Path: ${issue.path}\n`;
        if (issue.suggestion) {
          report += `     Suggestion: ${issue.suggestion}\n`;
        }
        report += '\n';
      });
    }
    
    if (warnings.length > 0) {
      report += '⚠️ Warnings:\n';
      warnings.forEach((issue, index) => {
        report += `  ${index + 1}. ${issue.message}\n`;
        report += `     Path: ${issue.path}\n`;
        if (issue.suggestion) {
          report += `     Suggestion: ${issue.suggestion}\n`;
        }
        report += '\n';
      });
    }
    
    if (info.length > 0) {
      report += '💡 Info:\n';
      info.forEach((issue, index) => {
        report += `  ${index + 1}. ${issue.message}\n`;
        report += `     Path: ${issue.path}\n`;
        if (issue.suggestion) {
          report += `     Suggestion: ${issue.suggestion}\n`;
        }
        report += '\n';
      });
    }
    
    return report;
  }
}

module.exports = TemplateLinter;