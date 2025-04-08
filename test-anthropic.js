// test-anthropic.js
require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

async function testAnthropicClient() {
  try {
    console.log("Anthropicクライアントのテストを開始します...");
    
    // APIキーの確認
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      throw new Error("環境変数CLAUDE_API_KEYが設定されていません。");
    }
    
    // Anthropicクライアントの初期化 - 正しい方法
    const client = new Anthropic({
      apiKey: apiKey,
    });
    
    console.log("Anthropicクライアントが正常に初期化されました。");
    
    // 簡単なメッセージ送信テスト - README通りの書き方
    console.log("テストメッセージを送信します...");
    const message = await client.messages.create({
      model: "claude-3-5-sonnet-latest", // 利用可能なモデルを使用
      max_tokens: 100,
      messages: [
        { role: "user", content: "こんにちは、Claudeさん。今日の調子はどうですか？" }
      ]
    });
    
    console.log("レスポンスを受信しました:");
    console.log("-------------------");
    console.log(message.content[0].text);
    console.log("-------------------");
    console.log("テストが成功しました！");
    
  } catch (error) {
    console.error("エラーが発生しました:", error);
    
    // より詳細なエラー情報
    if (error.response) {
      console.error("エラーレスポンス:", {
        status: error.response.status,
        data: error.response.data
      });
    }
  }
}

// スクリプト実行
testAnthropicClient();