import OpenAI from 'openai';

// OpenAI APIクライアントの設定
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: false, // ブラウザでは実行しないように設定
});

// APIキーがない場合の警告を出力
if (!process.env.OPENAI_API_KEY) {
  console.warn('WARNING: OPENAI_API_KEY is not set in environment variables!');
}

export default openai;