class ContentValidator {
    validateTestContent(content) {
      const requiredFields = [
        'hook', 
        'claim', 
        'specialInstruction', 
        'instruction', 
        'question', 
        'options', 
        'results',
        'closing'
      ];
      
      const errors = [];
      
      // Check required fields
      requiredFields.forEach(field => {
        if (!content[field]) {
          errors.push(`Missing required field: ${field}`);
        }
      });
      
      // Check options and results have the same length
      if (content.options && content.results && 
          content.options.length !== content.results.length) {
        errors.push(`Options count (${content.options.length}) does not match results count (${content.results.length})`);
      }
      
      return {
        isValid: errors.length === 0,
        errors
      };
    }
  }
  
  module.exports = ContentValidator;
  