// src/components/CommentGenerator.js
class CommentGenerator {
    constructor() {
      // 初期化処理
    }
    
    generateComments(content) {
      // コンテンツの確認
      if (!content) {
        console.error("CommentGenerator: コンテンツがnullまたはundefinedです");
        return "コメントを生成できませんでした";
      }
      
      console.log("CommentGenerator: コメントを生成します");
      
      // 必要なプロパティが存在するか確認
      if (!content.options || !content.results) {
        console.error("CommentGenerator: options または results プロパティがありません");
        return "正しい形式のコメントを生成できませんでした";
      }
      
      // optionsとresultsの数が一致するか確認
      if (content.options.length !== content.results.length) {
        console.warn(`CommentGenerator: optionsとresultsの数が一致しません (options: ${content.options.length}, results: ${content.results.length})`);
      }
      
      // コメントを生成
      const comments = [];
      const minLength = Math.min(content.options.length, content.results.length);
      
      for (let i = 0; i < minLength; i++) {
        comments.push(`${content.options[i]}: ${content.results[i]}`);
      }
      
      return comments.join("\n\n");
    }
  }
  
  module.exports = CommentGenerator;