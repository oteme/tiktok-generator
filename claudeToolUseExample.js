// claudeToolUseExample.js
// Example of how to set up Claude with Tool Use for Shotstack

const Anthropic = require('@anthropic-ai/sdk');
const config = require('./src/config');
const { runWithToolUse } = require('./src/index');

// Define the Shotstack API tool schema
const shotstackTool = {
  name: "shotstack",
  description: "Create videos using the Shotstack API",
  endpoints: [
    {
      name: "render",
      description: "Render a video using a template",
      method: "POST",
      path: "/render",
      schema: {
        type: "object",
        properties: {
          body: {
            type: "object",
            properties: {
              timeline: {
                type: "object",
                properties: {
                  background: { type: "string" },
                  tracks: { type: "array" }
                }
              },
              output: {
                type: "object",
                properties: {
                  format: { type: "string" },
                  resolution: { type: "string" }
                }
              }
            }
          }
        }
      }
    },
    {
      name: "render",
      description: "Get the status of a render job",
      method: "GET",
      path: "/render/{id}",
      schema: {
        type: "object",
        properties: {
          id: { type: "string" }
        },
        required: ["id"]
      }
    }
  ]
};

// Initialize Claude with Tool Use
async function initializeClaudeWithToolUse() {
  // Create Anthropic client
  const client = new Anthropic({
    apiKey: config.claude.apiKey
  });

  // Define the tools system prompt
  const systemPrompt = `
  You are an AI assistant specialized in creating TikTok videos using the Shotstack API.
  You will help users create text-based transition videos for love psychology tests.
  When asked to create a video, you'll use your tools to:
  1. Generate love psychology test content
  2. Format it as a Shotstack video template
  3. Render the video using Shotstack
  4. Provide the video URL, description, and comments
  `;

  // Tool use context that can be passed to our agent
  const toolContext = {
    tools: {
      shotstack: {
        render: {
          post: async (params) => {
            // Implement the actual API call to Shotstack here
            // For example:
            const axios = require('axios');
            const response = await axios.post(
              `${config.shotstack.apiUrl}/render`,
              params.body,
              {
                headers: {
                  'x-api-key': config.shotstack.apiKey,
                  'Content-Type': 'application/json'
                }
              }
            );
            return response;
          },
          get: async (params) => {
            // Implement the actual API call to Shotstack here
            const axios = require('axios');
            const response = await axios.get(
              `${config.shotstack.apiUrl}/render/${params.id}`,
              {
                headers: {
                  'x-api-key': config.shotstack.apiKey
                }
              }
            );
            return response;
          }
        }
      }
    }
  };

  // Example function to create a message with Claude using Tool Use
  async function createTikTokWithToolUse(userPrompt) {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-latest", // 利用可能なモデルに更新
      system: systemPrompt,
      max_tokens: 4000,
      tools: [shotstackTool],
      messages: [
        {
          role: "user",
          content: userPrompt
        }
      ]
    });
    
    // Process tool calls from Claude
    if (response.content.some(c => c.type === 'tool_use')) {
      // Handle tool use calls from Claude
      console.log("Tool use calls received from Claude");
      
      // In this example, we're not handling the full Claude conversation with tool use,
      // but instead using our agent directly with the toolContext
      const result = await runWithToolUse(toolContext);
      return result;
    }
    
    return response;
  }

  return {
    client,
    toolContext,
    createTikTokWithToolUse
  };
}

// Example usage
(async () => {
  try {
    const { createTikTokWithToolUse } = await initializeClaudeWithToolUse();
    
    const result = await createTikTokWithToolUse(
      "TikTok用の恋愛心理テスト動画を作成してください。文字だけが画面に表示されるシンプルなものでいいです。"
    );
    
    console.log("Video generation successful:");
    console.log(result);
  } catch (error) {
    console.error("Error:", error);
  }
})();

module.exports = { initializeClaudeWithToolUse };