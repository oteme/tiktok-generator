// debug-test-app.js
// テンプレート生成とShotstack連携を確認するデバッグ用アプリ
require('dotenv').config();
const VideoTemplateManager = require('./src/components/VideoTemplateManager');
const { ShotstackIntegration } = require('./src/components/ShotstackIntegration');

// テスト用の固定コンテンツ
const TEST_CONTENT = {
  hook: "待って！好きな人と目を合わせられない人は絶対試して👀",
  claim: "相手の本音と恋愛傾向が丸わかり",
  specialInstruction: "「超重要」このテストをした3日以内に恋が動き出します💘",
  followUp: "保存は運命の出会いのサイン✨",
  instruction: "これから質問するからイメージで答えてねって言って聞いてみて",
  question: "質問「疲れた時に一番したいことは？」",
  options: [
    "①ぐっすり眠る",
    "②美味しいものを食べる",
    "③誰かとおしゃべり",
    "④お風呂でゆっくり",
    "⑤音楽を聴く"
  ],
  results: [
    "①は「癒し系の恋」あなたといると心が落ち着くと感じている。その人にとってあなたは特別な存在",
    "②は「情熱的な恋」あなたと一緒にいると楽しくて仕方ない。でも少し警戒心も",
    "③は「親密な恋」あなたに全てを打ち明けたい気持ちでいっぱい。恋愛感情が急上昇中",
    "④は「秘めた恋」内心ドキドキしているけど、まだ自分の気持ちを整理できていない状態",
    "⑤は「運命の恋」あなたとの関係を大切にしたいと思っている。結婚を意識している可能性大"
  ],
  closing: "詳しい解説はコメント欄で✨"
};

async function runDebugTest() {
  try {
    console.log("デバッグ用テストを開始します...");
    
    // APIキーの確認
    const apiKey = process.env.SHOTSTACK_API_KEY;
    if (!apiKey) {
      throw new Error("環境変数SHOTSTACK_API_KEYが設定されていません。");
    }
    
    // VideoTemplateManagerの初期化と実行
    console.log("テンプレートを生成します...");
    const templateManager = new VideoTemplateManager({
      fontFamily: "Noto Sans JP",
      fontSize: 42,
      textColor: "#000000",
      backgroundColor: "#FFFFFF" // 紫色の背景
    });
    
    const template = templateManager.createVideoTemplate(TEST_CONTENT);
    
    // テンプレートの検証
    console.log("テンプレートの検証:");
    console.log("タイムライン:", template.timeline ? "存在します" : "存在しません");
    if (template.timeline && template.timeline.tracks) {
      console.log("トラック数:", template.timeline.tracks.length);
      if (template.timeline.tracks.length > 0 && template.timeline.tracks[0].clips) {
        console.log("クリップ数:", template.timeline.tracks[0].clips.length);
        
        // クリップの簡易情報
        template.timeline.tracks[0].clips.forEach((clip, index) => {
          const text = clip.asset.html ? 
            clip.asset.html.substring(0, 30) + "..." : 
            (clip.asset.text ? clip.asset.text.substring(0, 30) + "..." : "テキストなし");
          console.log(`クリップ ${index + 1}: ${text}, 開始: ${clip.start}, 長さ: ${clip.length}`);
        });
      }
    }
    
    // ShotstackIntegrationの初期化と実行
    console.log("\nShotstack APIに送信します...");
    const shotstackIntegration = new ShotstackIntegration(apiKey);
    
    const videoUrl = await shotstackIntegration.createVideo(template);
    
    console.log("\n===== 生成完了 =====");
    console.log(`動画URL: ${videoUrl}`);
    
    return videoUrl;
  } catch (error) {
    console.error("エラーが発生しました:", error);
    throw error;
  }
}

// テスト実行
runDebugTest()
  .then(url => {
    console.log("テスト成功:", url);
  })
  .catch(error => {
    console.error("テスト失敗:", error.message);
    process.exit(1);
  });