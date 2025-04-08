// mcpShotstackIntegration.js - 最終修正版
// Model Context Protocol (MCP) 実装例

const { Anthropic } = require('@anthropic-ai/sdk');
const axios = require('axios');
const config = require('./src/config');

class MCPShotstackIntegration {
  constructor() {
    // MCP doesn't need API keys in the constructor
    // They are provided by the MCP context
  }

  async createVideo(template, mcpContext) {
    try {
      // Use MCP to call Shotstack API
      const renderResponse = await mcpContext.invoke("shotstack", {
        method: "POST",
        endpoint: "/render",
        body: template
      });
      
      const { id } = renderResponse.data.response;
      console.log(`Video render job submitted with ID: ${id}`);
      
      // Poll for completion
      return await this._pollForCompletion(id, mcpContext);
    } catch (error) {
      console.error('Error creating video with MCP:', error);
      throw error;
    }
  }
  
  async _pollForCompletion(id, mcpContext, maxAttempts = 60, interval = 3000) {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const response = await mcpContext.invoke("shotstack", {
          method: "GET",
          endpoint: `/render/${id}`
        });
        
        const { status, url } = response.data.response;
        console.log(`Render status: ${status} (attempt ${attempts + 1}/${maxAttempts})`);
        
        if (status === 'done' && url) {
          console.log(`Render complete: ${url}`);
          return url;
        } else if (status === 'failed') {
          throw new Error('Render job failed');
        }
        
        // Wait before trying again
        await new Promise(resolve => setTimeout(resolve, interval));
        attempts++;
      } catch (error) {
        console.error('Error polling for video completion with MCP:', error);
        throw error;
      }
    }
    
    throw new Error('Render timed out');
  }
}

// Example of how to use the MCP integration with Claude 3.7 Sonnet
async function runWithMCP() {
  // This is a simplified example - actual MCP implementation would require
  // proper context setup from the calling environment

  // Define MCP context for Shotstack
  const mcpContext = {
    invoke: async (provider, request) => {
      // In a real MCP implementation, this would be handled by the MCP framework
      // Here we're mocking it with direct API calls
      
      if (provider === 'shotstack') {
        const { method, endpoint, body } = request;
        
        if (method === 'POST') {
          return await axios.post(
            `${config.shotstack.apiUrl}${endpoint}`,
            body,
            {
              headers: {
                'x-api-key': config.shotstack.apiKey,
                'Content-Type': 'application/json'
              }
            }
          );
        } else if (method === 'GET') {
          return await axios.get(
            `${config.shotstack.apiUrl}${endpoint}`,
            {
              headers: {
                'x-api-key': config.shotstack.apiKey
              }
            }
          );
        }
      } else if (provider === 'anthropic') {
        // 正しいAnthropicの呼び出し方法
        const anthropic = new Anthropic({
          apiKey: config.claude.apiKey
        });
        
        const { prompt, options } = request;
        return await anthropic.messages.create({
          model: config.claude.model,
          max_tokens: options.max_tokens || 1000,
          messages: [
            { role: "user", content: prompt }
          ],
          system: options.system || undefined
        });
      }
      
      throw new Error(`Unsupported MCP provider or method: ${provider} ${request.method}`);
    }
  };

  // Use the MCP integration with our TikTok generator
  const TikTokGenerator = require('./src/index').TikTokGenerator;
  
  const generator = new TikTokGenerator({
    claudeApiKey: config.claude.apiKey,
    creatorName: config.creator.name || 'ヒロ',
    useToolUse: true, // We're reusing the tool use integration pattern for MCP
    toolContext: mcpContext,
    videoOptions: {
      fontFamily: "Noto Sans JP",
      fontSize: 60,
      textColor: "#FFFFFF",
      backgroundColor: "#000000"
    }
  });

  try {
    const result = await generator.generateTikTok();
    console.log("TikTok generation with MCP complete!");
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error("Failed to generate TikTok with MCP:", error);
    throw error;
  }
}

module.exports = {
  MCPShotstackIntegration,
  runWithMCP
};

// Example usage:
// if (require.main === module) {
//   runWithMCP().catch(console.error);
// }