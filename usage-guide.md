# TikTok Text Animation Generator

このプロジェクトは、Claude 3.7 Sonnetと Shotstack APIを使用して、恋愛心理テストのTikTok動画を自動生成するシステムです。文字が画面上で遷移していくシンプルな動画を作成できます。

## 機能

- Claude 3.7 Sonnetによる恋愛心理テストの自動生成
- 生成されたコンテンツをShotstack APIを使用した動画への変換
- TikTok用の説明文と回答コメントの自動生成
- Tool UseまたはModel Context Protocol（MCP）によるAPI統合

## セットアップ方法

### 前提条件

- Node.js (v14以上)
- Claude API キー
- Shotstack API キー

### インストール

1. リポジトリをクローンする
```bash
git clone https://github.com/yourusername/tiktok-generator.git
cd tiktok-generator
```

2. 依存関係をインストールする
```bash
npm install
```

3. 環境変数を設定する
`.env.example`ファイルを`.env`にコピーし、必要な情報を入力します：

```
# Claude API
CLAUDE_API_KEY=your-claude-api-key

# Shotstack API
SHOTSTACK_API_KEY=your-shotstack-api-key
SHOTSTACK_API_URL=https://api.shotstack.io/v1

# Creator settings
CREATOR_NAME=ヒロ
CREATOR_HANDLE=hiro_renai_master
```

## 使用方法

### 基本的な使用方法

```javascript
const { runWithRegularApi } = require('./src/index');

// 通常のAPI統合方式で動画を生成
runWithRegularApi()
  .then(result => {
    console.log("動画URL:", result.videoUrl);
    console.log("説明文:", result.description);
    console.log("コメント:", result.comments);
  })
  .catch(console.error);
```

### Tool Use機能を使用する場合

```javascript
const { initializeClaudeWithToolUse } = require('./claudeToolUseExample');

(async () => {
  const { createTikTokWithToolUse } = await initializeClaudeWithToolUse();
  
  const result = await createTikTokWithToolUse(
    "TikTok用の恋愛心理テスト動画を作成してください。文字だけが画面に表示されるシンプルなものでいいです。"
  );
  
  console.log("生成された動画のURL:", result.videoUrl);
})();
```

### Model Context Protocol (MCP) を使用する場合

```javascript
const { runWithMCP } = require('./mcpShotstackIntegration');

runWithMCP()
  .then(result => {
    console.log("動画URL:", result.videoUrl);
    console.log("説明文:", result.description);
    console.log("コメント:", result.comments);
  })
  .catch(console.error);
```

## カスタマイズ

### 動画デザインのカスタマイズ

`src/config.js`の`video`セクションを編集して、フォント、サイズ、色などを変更できます：

```javascript
video: {
  fontFamily: "Noto Sans JP",
  fontSize: 60,
  textColor: "#FFFFFF",
  backgroundColor: "#000000",
  duration: 15.0,
  transitionDuration: 0.5
}
```

### 生成される内容のカスタマイズ

心理テストの内容や形式を変更したい場合は、`ContentGenerator.js`の`generateLoveTest`メソッド内のプロンプトを編集してください。

## プロジェクト構造

```
tiktok-generator/
├── src/
│   ├── components/
│   │   ├── ContentGenerator.js      // Claudeを使ってテスト内容を生成
│   │   ├── VideoTemplateManager.js  // Shotstack互換のテンプレートを作成
│   │   ├── ShotstackIntegration.js  // Shotstack APIとの連携
│   │   ├── DescriptionGenerator.js  // 動画説明を作成
│   │   └── CommentGenerator.js      // コメント回答を生成
│   ├── utils/
│   │   ├── logger.js                // ロギングユーティリティ
│   │   └── validator.js             // コンテンツ検証
│   ├── config.js                    // 設定
│   └── index.js                     // メインエントリーポイント
├── claudeToolUseExample.js          // Tool Use機能の例
├── mcpShotstackIntegration.js       // MCP統合の例
├── .env                             // 環境変数（APIキーなど）
└── package.json                     // 依存関係
```

## 注意事項

- Shotstack APIの使用には料金がかかる場合があります。公式ドキュメントを確認してください。
- Claude APIの使用にも料金がかかります。使用量を監視してください。
- 生成されたコンテンツの使用については、適切な権利や法律に従ってください。

## トラブルシューティング

### よくある問題

1. **APIキーエラー**
   - 環境変数が正しく設定されているか確認してください。

2. **動画レンダリングの失敗**
   - Shotstackのログを確認し、テンプレートが正しいフォーマットであることを確認してください。

3. **Claude APIエラー**
   - API使用量制限に達していないか確認してください。
   - プロンプトが適切かどうか確認してください。

### デバッグ

デバッグ情報を有効にするには、Loggerインスタンスを初期化する際に`debug: true`を設定してください：

```javascript
const Logger = require('./src/utils/logger');
const logger = new Logger({ debug: true });
```
