// app.js - 修正版 日本語対応TikTok動画生成システム
require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const { ShotstackIntegration } = require('./src/components/ShotstackIntegration');
const VideoTemplateManager = require('./src/components/VideoTemplateManager');
const CommentGenerator = require('./src/components/CommentGenerator');
const DescriptionGenerator = require('./src/components/DescriptionGenerator');

// Shotstack APIのエンドポイントオプション
const SHOTSTACK_ENDPOINTS = {
  PRODUCTION: 'https://api.shotstack.io/v1',       // 本番環境
  STAGING: 'https://api.shotstack.io/stage',       // ステージング環境
  EDIT_V1: 'https://api.shotstack.io/edit/v1'      // 代替形式
};

// サンプルの心理テストコンテンツ
const SAMPLE_CONTENT = {
  hook: "理想の相手を見極める心理テスト",
  claim: "この質問であなたの本当の恋愛タイプがわかります",
  specialInstruction: "「重要」テスト後10分以内に好きな人からメッセージが来たらそれは運命の証",
  followUp: "いいね&保存で恋愛運アップ↑↑",
  instruction: "質問の答えを見せないで、好きな人に答えてもらって",
  question: "質問:「もし私が動物に生まれ変わるとしたら何になると思う？」",
  options: ["①猫", "②犬", "③うさぎ", "④パンダ", "⑤イルカ"],
  results: [
    "猫を選んだ人：あなたのクールな魅力に惹かれている。でも近づきがたいと感じている。脈あり度80%",
    "犬を選んだ人：あなたを心から信頼している。ずっと側にいてほしいと思っている。脈あり度95%",
    "うさぎを選んだ人：あなたの愛らしさに夢中。でも告白する勇気がない。脈あり度75%",
    "パンダを選んだ人：あなたとの距離感が心地よい。このままの関係を大切にしたいと思っている。脈あり度60%",
    "イルカを選んだ人：あなたの知的な面に惹かれている。真剣な交際を考えている。脈あり度90%"
  ],
  closing: "結果の詳しい解説はコメント欄で👇"
};

async function generateTikTok() {
  try {
    console.log("日本語対応 TikTok恋愛心理テスト動画の生成を開始します...");
    
    // 1. 環境変数の確認
    const apiKey = process.env.SHOTSTACK_API_KEY;
    if (!apiKey) {
      throw new Error("環境変数SHOTSTACK_API_KEYが設定されていません。");
    }
    
    // 2. 各コンポーネントの初期化
    const videoTemplateManager = new VideoTemplateManager({
      fontFamily: "Noto Sans JP", // 日本語フォント
      fontSize: 42,
      textColor: "#000000",
      backgroundColor: "#FFFFFF" 
    });
    
    const descriptionGenerator = new DescriptionGenerator(process.env.CREATOR_NAME || 'ヒロ');
    const commentGenerator = new CommentGenerator();
    
    // Shotstack APIクライアント初期化
    // 本番環境のエンドポイントを使用
    const shotstackIntegration = new ShotstackIntegration(
      apiKey,
      SHOTSTACK_ENDPOINTS.PRODUCTION
    );
    
    // 3. 心理テストコンテンツを取得
    let testContent;
    try {
      console.log("心理テストコンテンツを生成中...");
      testContent = await generateLoveTest();
      console.log("コンテンツ生成完了");
    } catch (error) {
      console.error("コンテンツ生成エラー:", error);
      console.log("サンプルコンテンツを使用します");
      testContent = SAMPLE_CONTENT;
    }
    
    // 4. ビデオテンプレートの作成
    console.log("ビデオテンプレートを作成中...");
    const videoTemplate = videoTemplateManager.createVideoTemplate(testContent);
    
    // 5. Shotstackで動画を生成
    console.log("動画をレンダリング中...");
    const videoUrl = await shotstackIntegration.createVideo(videoTemplate);
    
    // 6. 説明文とコメントを生成
    console.log("説明文とコメントを生成中...");
    const description = descriptionGenerator.generateDescription(testContent);
    const comments = commentGenerator.generateComments(testContent);
    
    // 7. 結果を表示
    console.log("\n===== 生成完了 =====");
    console.log(`動画URL: ${videoUrl}`);
    console.log("\n【説明文】");
    console.log(description);
    console.log("\n【コメント】");
    console.log(comments);
    console.log("\n生成された動画URLにアクセスして動画をダウンロードし、TikTokにアップロードできます。");
    
    return {
      videoUrl,
      description,
      comments,
      content: testContent
    };
  } catch (error) {
    console.error("エラーが発生しました:", error);
    console.error("エラーの詳細:", error.response?.data || error.message);
    
    // Shotstack APIのバリデーションエラーの詳細表示
    if (error.response?.data?.response?.error?.details) {
      console.error("バリデーションエラーの詳細:");
      error.response.data.response.error.details.forEach((detail, index) => {
        console.error(`${index + 1}. フィールド: ${detail.field}, メッセージ: ${detail.message}`);
      });
    }
    
    throw error;
  }
}

// Claude APIを使用して恋愛心理テストを生成する関数
async function generateLoveTest() {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    throw new Error("環境変数CLAUDE_API_KEYが設定されていません。");
  }
  
  const client = new Anthropic({ apiKey });
  
  const prompt = `
  あなたは恋愛心理テスト作成の専門家です。TikTokで人気が出るような恋愛心理テストを作成してください。

  以下の構造に従って作成してください：
  1. フック（視聴者の興味を引く短い導入文）
  2. このテストで何がわかるかという主張
  3. 「超重要」などの注目を集めるキーワードと特別な指示
  4. 友達や好きな人に聞いてもらう質問
  5. 5つの選択肢（例：①赤②青③白④ピンク⑤紫）
  6. それぞれの選択肢の意味の説明（コメント欄用）

  以下の形式のJSONで返してください：
  {
    "hook": "好きな人にこれ聞いてみて",
    "claim": "この質問でその人があなたをどう思っているかわかります",
    "specialInstruction": "「超重要」LINEの共有から３番目の人はあなたの運命の人",
    "followUp": "いいねフォローすると恋愛運上がります",
    "instruction": "答えは秘密だよって言って好きな人に質問してみて",
    "question": "質問「私って色に例えると何色？」",
    "options": ["①赤", "②青", "③白", "④ピンク", "⑤紫"],
    "results": [
      "赤は親密の赤 あなたを兄弟姉妹のように思ってる",
      "青は冷静の青 あなたを恋人という視点から今後も支えていきたいと思ってる",
      "白は純粋の白 真っ白だからこ汚したくない理想の人だと思ってる",
      "ピンクは友情のピンク 友人のように激しく慕っている",
      "紫は私欲の紫 あなたの身体にメロメロだと思ってる"
    ],
    "closing": "結果はコメント欄へ"
  }
  
  新しい心理テストを作成してください。上記の例と同じものは避けてください。`;
  
  console.log("Claudeにリクエスト送信中...");
  const response = await client.messages.create({
    model: "claude-3-5-sonnet-latest",
    max_tokens: 1000,
    messages: [
      { role: "user", content: prompt }
    ],
    system: "あなたはバイラルなTikTokコンテンツ、特に恋愛心理テストの作成に特化した専門家です。常に適切な形式のJSONオブジェクトで回答してください。"
  });
  
  // JSONを抽出して解析
  console.log("Claudeからのレスポンス受信:");
  console.log(response.content[0].text);
  
  const match = response.content[0].text.match(/```json\n([\s\S]*?)\n```/) || 
                response.content[0].text.match(/\{[\s\S]*\}/);
                
  if (match) {
    const parsedJSON = JSON.parse(match[1] || match[0]);
    console.log("\n解析されたJSON:");
    console.log(JSON.stringify(parsedJSON, null, 2));
    return parsedJSON;
  } else {
    throw new Error("Claudeのレスポンスからのテストコンテンツの抽出に失敗しました");
  }
}

// 実行
generateTikTok().catch(console.error);