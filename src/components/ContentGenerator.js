// src/components/ContentGenerator.js
const Anthropic = require('@anthropic-ai/sdk');

class ContentGenerator {
  constructor(apiKey) {
    this.client = new Anthropic({ apiKey });
  }
  
  async generateLoveTest() {
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
    
    try {
      const response = await this.client.messages.create({
        model: "claude-3-5-sonnet-latest", // 利用可能なモデルに更新
        max_tokens: 1000,
        messages: [
          { role: "user", content: prompt }
        ],
        system: "あなたはバイラルなTikTokコンテンツ、特に恋愛心理テストの作成に特化した専門家です。常に適切な形式のJSONオブジェクトで回答してください。"
      });
      
      // Extract and parse JSON from Claude's response
      const match = response.content[0].text.match(/```json\n([\s\S]*?)\n```/) || 
                    response.content[0].text.match(/\{[\s\S]*\}/);
                    
      if (match) {
        return JSON.parse(match[1] || match[0]);
      } else {
        throw new Error("Failed to extract JSON from Claude's response");
      }
    } catch (error) {
      console.error("Error generating content:", error);
      throw error;
    }
  }
}

module.exports = ContentGenerator;