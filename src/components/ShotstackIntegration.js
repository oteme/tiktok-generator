// src/components/ShotstackIntegration.js
const axios = require('axios');

class ShotstackIntegration {
  constructor(apiKey, apiUrl = 'https://api.shotstack.io/v1') {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    // デバッグフラグ
    this.debug = true;
  }
  
  async createVideo(template) {
    try {
      // テンプレートの検証
      if (this.debug) {
        console.log("ShotstackIntegration: 受け取ったテンプレートの確認");
        console.log("タイムライン: ", template.timeline ? "存在します" : "存在しません");
        
        if (template.timeline && template.timeline.tracks) {
          console.log("トラック数: ", template.timeline.tracks.length);
          
          if (template.timeline.tracks.length > 0 && template.timeline.tracks[0].clips) {
            console.log("クリップ数: ", template.timeline.tracks[0].clips.length);
          } else {
            console.log("クリップがありません");
          }
        }
      }
      
      // Submit the render job without converting the template
      console.log("Shotstack APIにリクエストを送信します...");
      console.log(JSON.stringify(template, null, 2));
      
      const response = await this.client.post('/render', template);
      
      if (response.data && response.data.success) {
        const { id } = response.data.response;
        console.log(`Video render job submitted with ID: ${id}`);
        
        // Poll for completion
        return await this._pollForCompletion(id);
      } else {
        console.error('Shotstack API error:', response.data);
        throw new Error(`Shotstack API returned an error: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error creating video:', error.message);
      
      // より詳細なエラー情報があれば出力
      if (error.response && error.response.data) {
        console.error('Error response:', error.response.data);
        
        if (error.response.data.response && 
            error.response.data.response.error && 
            error.response.data.response.error.details) {
          console.error('Validation errors:');
          error.response.data.response.error.details.forEach(detail => {
            console.error(`- Field: ${detail.field}, Message: ${detail.message}`);
          });
        }
      }
      
      throw error;
    }
  }
  
  async _pollForCompletion(id, maxAttempts = 60, interval = 3000) {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const response = await this.client.get(`/render/${id}`);
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
        console.error('Error polling for video completion:', error.response?.data || error.message);
        throw error;
      }
    }
    
    throw new Error('Render timed out');
  }
}

// Tool Use版の修正
class ToolUseShotstackIntegration {
  constructor() {
    this.debug = true;
  }
  
  async createVideo(template, toolContext) {
    try {
      // テンプレートの検証
      if (this.debug) {
        console.log("ToolUseShotstackIntegration: 受け取ったテンプレートの確認");
        console.log("タイムライン: ", template.timeline ? "存在します" : "存在しません");
        
        if (template.timeline && template.timeline.tracks) {
          console.log("トラック数: ", template.timeline.tracks.length);
          
          if (template.timeline.tracks.length > 0 && template.timeline.tracks[0].clips) {
            console.log("クリップ数: ", template.timeline.tracks[0].clips.length);
          } else {
            console.log("クリップがありません");
          }
        }
      }
      
      console.log("Shotstack APIにリクエストを送信します...");
      
      // Use Tool to call Shotstack API with the original template
      const renderResponse = await toolContext.tools.shotstack.render.post({
        body: template
      });
      
      const { id } = renderResponse.data.response;
      console.log(`Video render job submitted with ID: ${id}`);
      
      // Poll for completion
      return await this._pollForCompletion(id, toolContext);
    } catch (error) {
      console.error('Error creating video with tool use:', error);
      throw error;
    }
  }
  
  async _pollForCompletion(id, toolContext, maxAttempts = 60, interval = 3000) {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const response = await toolContext.tools.shotstack.render.get({
        id: id
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
    }
    
    throw new Error('Render timed out');
  }
}

module.exports = { 
  ShotstackIntegration,
  ToolUseShotstackIntegration
};