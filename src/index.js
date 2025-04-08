// src/index.js
require('dotenv').config();
const ContentGenerator = require('./components/ContentGenerator');
const VideoTemplateManager = require('./components/VideoTemplateManager');
const { ShotstackIntegration, ToolUseShotstackIntegration } = require('./components/ShotstackIntegration');
const DescriptionGenerator = require('./components/DescriptionGenerator');
const CommentGenerator = require('./components/CommentGenerator');

class TikTokGenerator {
  constructor(config) {
    this.contentGenerator = new ContentGenerator(config.claudeApiKey);
    this.videoTemplateManager = new VideoTemplateManager(config.videoOptions);
    
    // Use either standard API integration or Tool Use based on config
    if (config.useToolUse && config.toolContext) {
      this.shotstackIntegration = new ToolUseShotstackIntegration();
      this.toolContext = config.toolContext;
    } else {
      this.shotstackIntegration = new ShotstackIntegration(
        config.shotstackApiKey, 
        config.shotstackApiUrl
      );
    }
    
    this.descriptionGenerator = new DescriptionGenerator(config.creatorName);
    this.commentGenerator = new CommentGenerator();
  }
  
  async generateTikTok() {
    try {
      // 1. Generate the love test content
      console.log("Generating psychology test content...");
      const testContent = await this.contentGenerator.generateLoveTest();
      
      // 2. Create the video template
      console.log("Creating video template...");
      const videoTemplate = this.videoTemplateManager.createVideoTemplate(testContent);
      
      // 3. Generate the video using Shotstack
      console.log("Rendering video with Shotstack...");
      let videoUrl;
      if (this.toolContext) {
        videoUrl = await this.shotstackIntegration.createVideo(videoTemplate, this.toolContext);
      } else {
        videoUrl = await this.shotstackIntegration.createVideo(videoTemplate);
      }
      
      // 4. Generate the description
      console.log("Generating video description...");
      const description = this.descriptionGenerator.generateDescription(testContent);
      
      // 5. Generate the comments
      console.log("Generating comment responses...");
      const comments = this.commentGenerator.generateComments(testContent);
      
      // 6. Return the complete package
      return {
        videoUrl,
        description,
        comments,
        content: testContent
      };
    } catch (error) {
      console.error("Error generating TikTok:", error);
      throw error;
    }
  }
}

// Example usage with regular API integration
async function runWithRegularApi() {
  const tikTokGenerator = new TikTokGenerator({
    claudeApiKey: process.env.CLAUDE_API_KEY,
    shotstackApiKey: process.env.SHOTSTACK_API_KEY,
    shotstackApiUrl: process.env.SHOTSTACK_API_URL || 'https://api.shotstack.io/v1',
    creatorName: process.env.CREATOR_NAME || 'ヒロ',
    videoOptions: {
      fontFamily: "Noto Sans JP",
      fontSize: 60,
      textColor: "#FFFFFF",
      backgroundColor: "#000000"
    }
  });

  try {
    const result = await tikTokGenerator.generateTikTok();
    console.log("TikTok generation complete!");
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error("Failed to generate TikTok:", error);
    throw error;
  }
}

// Example usage with Claude Tool Use
async function runWithToolUse(toolContext) {
  const tikTokGenerator = new TikTokGenerator({
    claudeApiKey: process.env.CLAUDE_API_KEY,
    creatorName: process.env.CREATOR_NAME || 'ヒロ',
    useToolUse: true,
    toolContext: toolContext,
    videoOptions: {
      fontFamily: "Noto Sans JP",
      fontSize: 60,
      textColor: "#FFFFFF",
      backgroundColor: "#000000"
    }
  });

  try {
    const result = await tikTokGenerator.generateTikTok();
    console.log("TikTok generation complete!");
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error("Failed to generate TikTok:", error);
    throw error;
  }
}

// Export both methods
module.exports = {
  TikTokGenerator,
  runWithRegularApi,
  runWithToolUse
};

// Run directly if called as a script
if (require.main === module) {
  runWithRegularApi().catch(console.error);
}