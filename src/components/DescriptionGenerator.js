// src/components/DescriptionGenerator.js
class DescriptionGenerator {
    constructor(defaultName = "ヒロ") {
      this.defaultName = defaultName;
      this.hashtags = [
        "#モテるコミュ力上昇法",
        "#女性心理",
        "#恋愛相談",
        "#恋愛心理学",
        "#自分磨き",
        "#内面磨き",
        "#恋愛",
        "#デート",
        "#恋愛テクニック",
        "#結婚",
        "#社会人恋愛",
        "#遠距離恋愛",
        "#社会人",
        "#男性心理"
      ];
    }
    
    generateDescription(content) {
      console.log("DescriptionGenerator: 説明文を生成します");
      
      // コンテンツの確認
      if (!content) {
        console.warn("DescriptionGenerator: コンテンツがnullまたはundefinedです");
        // デフォルトの説明文を返す
        return this._createDefaultDescription();
      }
      
      const baseDescription = `こんにちは！${this.defaultName}です☺️ いつもご覧頂きありがとうございます
  「女性心理」や「彼氏を作るためのコミュカ上昇法」について発信しております☺️
  「明日からできる彼氏を作るためのコミュカ上昇法」という無料テキストも配布しております！
  プロフィール欄のURLから受け取り可能です！🥰
  ぜひお気軽に受け取ってください
  少しでも参考になりましたらフォロー＆保存よろしくお願いします！！
  フォローはこちらから！！
  ⬇️⬇️⬇️
  @${this.defaultName.toLowerCase()}_renai_master`;
      
      // Add hashtags
      const description = `${baseDescription}\n${this.hashtags.join(' ')}`;
      
      return description;
    }
    
    // デフォルトの説明文を生成
    _createDefaultDescription() {
      const baseDescription = `こんにちは！${this.defaultName}です☺️ いつもご覧頂きありがとうございます
  「女性心理」や「彼氏を作るためのコミュカ上昇法」について発信しております☺️
  「明日からできる彼氏を作るためのコミュカ上昇法」という無料テキストも配布しております！
  プロフィール欄のURLから受け取り可能です！🥰
  ぜひお気軽に受け取ってください
  少しでも参考になりましたらフォロー＆保存よろしくお願いします！！
  フォローはこちらから！！
  ⬇️⬇️⬇️
  @${this.defaultName.toLowerCase()}_renai_master`;
      
      // Add hashtags
      return `${baseDescription}\n${this.hashtags.join(' ')}`;
    }
  }
  
  module.exports = DescriptionGenerator;