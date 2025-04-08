require('dotenv').config();

const config = {
  claude: {
    apiKey: process.env.CLAUDE_API_KEY,
    model: "claude-3-7-sonnet-20250219"
  },
  shotstack: {
    apiKey: process.env.SHOTSTACK_API_KEY,
    apiUrl: process.env.SHOTSTACK_API_URL || 'https://api.shotstack.io/v1'
  },
  creator: {
    name: process.env.CREATOR_NAME || 'ヒロ',
    handle: process.env.CREATOR_HANDLE || 'hiro_renai_master'
  },
  video: {
    fontFamily: "Noto Sans JP",
    fontSize: 60,
    textColor: "#FFFFFF",
    backgroundColor: "#000000",
    duration: 15.0,
    transitionDuration: 0.5
  }
};

module.exports = config;