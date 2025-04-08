class Logger {
    constructor(options = {}) {
      this.debug = options.debug || false;
      this.prefix = options.prefix || 'TikTokGenerator';
    }
    
    log(message) {
      console.log(`[${this.prefix}] ${message}`);
    }
    
    error(message, error) {
      console.error(`[${this.prefix}] ERROR: ${message}`);
      if (error) {
        console.error(error);
      }
    }
    
    debug(message) {
      if (this.debug) {
        console.debug(`[${this.prefix}] DEBUG: ${message}`);
      }
    }
    
    warn(message) {
      console.warn(`[${this.prefix}] WARNING: ${message}`);
    }
  }
  
  module.exports = Logger;