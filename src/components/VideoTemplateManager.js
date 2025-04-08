// src/components/VideoTemplateManager.js (デバッグ版)
class VideoTemplateManager {
    constructor(options = {}) {
      this.defaults = {
        width: 1080,
        height: 1920,              // TikTok縦向き動画
        fontFamily: "Noto Sans JP", // 日本語フォント
        fontSize: 42,
        textColor: "#000000",
        backgroundColor: "#FFFFFF", // 紫色の背景
        duration: 30.0,            // 15秒動画
        transitionDuration: 0.5,
        ...options
      };
      
      // デバッグ用フラグ
      this.debug = true;
    }
    
    createVideoTemplate(content) {
      console.log("VideoTemplateManager: createVideoTemplateが呼び出されました");
      
      // コンテンツの確認
      if (!content) {
        console.error("VideoTemplateManager: コンテンツがnullまたはundefinedです");
        // デフォルトのコンテンツを作成
        content = this._createDefaultContent();
      }
      
      // 必須プロパティが存在するか確認
      const requiredProps = [
        'hook', 'claim', 'specialInstruction', 'followUp', 
        'instruction', 'question', 'options', 'closing'
      ];
      
      let missingProps = [];
      requiredProps.forEach(prop => {
        if (!content[prop]) {
          console.warn(`VideoTemplateManager: コンテンツに '${prop}' プロパティがありません`);
          missingProps.push(prop);
        }
      });
      
      if (missingProps.length > 0) {
        console.error("VideoTemplateManager: 不足しているプロパティがあります:", missingProps.join(', '));
        content = this._fillMissingProperties(content, missingProps);
      }
      
      // 各要素をログに出力
      if (this.debug) {
        console.log("VideoTemplateManager: コンテンツのプロパティ:");
        requiredProps.forEach(prop => {
          const value = content[prop];
          console.log(`- ${prop}: ${Array.isArray(value) ? JSON.stringify(value) : value}`);
        });
      }
      
      // クリップの数とクリップあたりの時間を計算
      const clipCount = 8; // テキストフレームの数
      const clipDuration = (this.defaults.duration - (clipCount * this.defaults.transitionDuration)) / clipCount;
      
      let currentTime = 0;
      
      // オプションを適切な形式に変換（配列が文字列の場合）
      const formattedOptions = Array.isArray(content.options) 
        ? content.options.join("<br>") 
        : (content.options || "オプションなし");
      
      // クリップの配列を作成
      const clips = [
        this._createHtmlClip(content.hook, currentTime, currentTime += clipDuration),
        this._createHtmlClip(content.claim, currentTime, currentTime += clipDuration),
        this._createHtmlClip(content.specialInstruction, currentTime, currentTime += clipDuration),
        this._createHtmlClip(content.followUp, currentTime, currentTime += clipDuration),
        this._createHtmlClip(content.instruction, currentTime, currentTime += clipDuration),
        this._createHtmlClip(content.question, currentTime, currentTime += clipDuration),
        this._createHtmlClip(formattedOptions, currentTime, currentTime += clipDuration),
        this._createHtmlClip(content.closing, currentTime, currentTime += clipDuration)
      ];
      
      console.log(`VideoTemplateManager: ${clips.length}個のクリップを作成しました`);
      
      // クリップを日本語対応テンプレートに変換
      const template = {
        timeline: {
          // 日本語フォントを明示的に指定
          fonts: [
            {
              src: "https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/fonts/NotoSansJP-Regular.otf"
            }
          ],
          background: this.defaults.backgroundColor,
          tracks: [
            {
              clips: clips
            }
          ]
        },
        output: {
          format: "mp4",
          size: {
            width: 1080,
            height: 1920
          }
        }
      };
      
      // 作成したテンプレートの確認
      if (this.debug) {
        console.log("VideoTemplateManager: 作成されたテンプレート:");
        console.log(JSON.stringify(template, null, 2));
      }
      
      return template;
    }
    
    // 不足しているプロパティを埋める
    _fillMissingProperties(content, missingProps) {
      const filledContent = { ...content };
      
      const defaults = {
        hook: "恋愛心理テスト",
        claim: "この質問であなたの恋愛傾向がわかります",
        specialInstruction: "「超重要」友達にもシェアして結果を比べてみよう",
        followUp: "いいね&フォローで恋愛運アップ↑",
        instruction: "好きな人に質問してみよう",
        question: "質問：あなたにとって理想のデートは？",
        options: ["①カフェ", "②映画", "③ショッピング", "④公園", "⑤遊園地"],
        closing: "結果はコメント欄へ"
      };
      
      missingProps.forEach(prop => {
        filledContent[prop] = defaults[prop];
      });
      
      return filledContent;
    }
    
    // デフォルトのコンテンツを作成
    _createDefaultContent() {
      return {
        hook: "恋愛心理テスト",
        claim: "この質問であなたの恋愛傾向がわかります",
        specialInstruction: "「超重要」友達にもシェアして結果を比べてみよう",
        followUp: "いいね&フォローで恋愛運アップ↑",
        instruction: "好きな人に質問してみよう",
        question: "質問：あなたにとって理想のデートは？",
        options: ["①カフェ", "②映画", "③ショッピング", "④公園", "⑤遊園地"],
        results: [
          "カフェを選んだ人：落ち着いた環境でじっくり会話したい、知的な関係を求めています",
          "映画を選んだ人：一緒に感動や興奮を共有したい、感情的なつながりを求めています",
          "ショッピングを選んだ人：センスや好みを知りたい、趣味や価値観の一致を重視します",
          "公園を選んだ人：自然の中でリラックスしたい、ありのままの関係を求めています",
          "遊園地を選んだ人：スリルや冒険を共有したい、刺激的な関係を求めています"
        ],
        closing: "結果はコメント欄へ"
      };
    }
    
    // HTML形式の日本語対応クリップを作成
    _createHtmlClip(text, start, end) {
      // テキストが存在しない場合の処理
      const safeText = text || "テキストなし";
      
      console.log(`VideoTemplateManager: クリップを作成 - Text: "${safeText.substring(0, 20)}...", Start: ${start}, End: ${end}`);
      
      // HTML形式のクリップを作成
      return {
        asset: {
          type: "html",
          html: `<p>${safeText}</p>`,
          css: `p { 
            font-family: 'Noto Sans JP'; 
            color: ${this.defaults.textColor}; 
            font-size: ${this.defaults.fontSize}px; 
            text-align: center;
            padding: 20px;
          }`,
          width: 820,
          height: 320
        },
        start: start,
        length: end - start,
        transition: {
            "in": "fade",
            "out": "fade",
        },
        position: "center"
      };
    }
    
    // 旧バージョンとの互換性のために残す
    _createTextFrame(text, start, end) {
      return this._createHtmlClip(text, start, end);
    }
  }
  
  module.exports = VideoTemplateManager;