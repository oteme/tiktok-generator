// japanese-test.js
// 日本語テキストでShotstack APIをテスト
require('dotenv').config();
const axios = require('axios');

// 日本語テキストを含むテンプレート
const japaneseTemplate = {
  "timeline": {
    "fonts": [
      {
        "src": "https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/fonts/NotoSansJP-Regular.otf"
      }
    ],
    "soundtrack": {
      "src": "https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/music/freepd/fireworks.mp3",
      "effect": "fadeOut"
    },
    "background": "#b999f5",
    "tracks": [
      {
        "clips": [
          {
            "asset": {
              "type": "html",
              "html": "<p>こんにちは！これは日本語テストです</p>",
              "css": "p { font-family: 'Noto Sans JP'; color: #ffffff; font-size: 42px; text-align: center; }",
              "width": 1080,
              "height": 1920
            },
            "start": 0,
            "length": 5,
            "transition": {
              "in": "fade",
              "out": "fade"
            },
            "position": "center"
          },
          {
            "asset": {
              "type": "html",
              "html": "<p>これは恋愛心理テストの例です❤️</p>",
              "css": "p { font-family: 'Noto Sans JP'; color: #ffffff; font-size: 42px; text-align: center; }",
              "width": 1080,
              "height": 1920
            },
            "start": 5,
            "length": 5,
            "transition": {
              "in": "fade",
              "out": "fade"
            },
            "position": "center"
          }
        ]
      }
    ]
  },
  "output": {
    "format": "mp4",
    "resolution": "hd"
  }
};

async function testJapanese() {
  try {
    console.log("日本語テキストでShotstack APIをテストします...");
    
    // APIキーの確認
    const apiKey = process.env.SHOTSTACK_API_KEY;
    if (!apiKey) {
      throw new Error("環境変数SHOTSTACK_API_KEYが設定されていません。");
    }
    
    const apiUrl = 'https://api.shotstack.io/v1';
    console.log("Shotstack APIに接続します:", apiUrl);
    
    // APIクライアントの初期化
    const client = axios.create({
      baseURL: apiUrl,
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    console.log("日本語テンプレートを送信します...");
    console.log(JSON.stringify(japaneseTemplate, null, 2));
    
    // レンダリングジョブを送信
    const response = await client.post('/render', japaneseTemplate);
    
    if (response.data && response.data.success) {
      const { id } = response.data.response;
      console.log(`レンダリングジョブが送信されました。ID: ${id}`);
      
      // レンダリング完了を確認する
      console.log("レンダリングステータスを監視します...");
      let status;
      let url;
      let attempts = 0;
      const maxAttempts = 20;
      const interval = 3000;
      
      while (attempts < maxAttempts) {
        const statusResponse = await client.get(`/render/${id}`);
        status = statusResponse.data.response.status;
        url = statusResponse.data.response.url;
        
        console.log(`レンダリングステータス: ${status} (試行回数: ${attempts + 1}/${maxAttempts})`);
        
        if (status === 'done' && url) {
          console.log(`レンダリング完了: ${url}`);
          break;
        } else if (status === 'failed') {
          throw new Error('レンダリングジョブが失敗しました');
        }
        
        await new Promise(resolve => setTimeout(resolve, interval));
        attempts++;
      }
      
      if (attempts >= maxAttempts && status !== 'done') {
        console.log("タイムアウト: 現在の状態は", status);
      }
    } else {
      console.error("APIエラー:", response.data);
    }
  } catch (error) {
    console.error("エラーが発生しました:", error.message);
    
    // エラーの詳細情報を表示
    if (error.response) {
      console.error("エラーレスポンス:", {
        status: error.response.status,
        data: JSON.stringify(error.response.data, null, 2)
      });
      
      if (error.response.data && 
          error.response.data.response && 
          error.response.data.response.error && 
          error.response.data.response.error.details) {
        console.error("バリデーションエラーの詳細:");
        error.response.data.response.error.details.forEach((detail, index) => {
          console.error(`${index + 1}. フィールド: ${detail.field}, メッセージ: ${detail.message}`);
        });
      }
    }
  }
}

// テストを実行
testJapanese();