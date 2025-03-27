import { NextRequest, NextResponse } from 'next/server';
import openai from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { text, sourceLanguage, targetLanguage } = await request.json();

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Text and target language are required' },
        { status: 400 }
      );
    }

    // 言語名のマッピング（コードから表示名へ）
    const languageNameMap: Record<string, string> = {
      'en': 'English',
      'ja': 'Japanese',
      'zh': 'Chinese',
      'ko': 'Korean',
      'vi': 'Vietnamese',
      'fr': 'French',
      'de': 'German',
      'es': 'Spanish',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'th': 'Thai'
    };

    // 言語名を取得（コードがマップにない場合はコードをそのまま使用）
    const sourceLangName = sourceLanguage ? (languageNameMap[sourceLanguage] || sourceLanguage) : 'the detected language';
    const targetLangName = languageNameMap[targetLanguage] || targetLanguage;

    // OpenAI ChatGPT APIを使用してテキスト翻訳
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text from ${sourceLangName} to ${targetLangName}. Provide only the translated text without any additional explanations or notes.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3, // 翻訳の一貫性を高めるために低めの温度設定
      max_tokens: 2000,
    });

    const translatedText = response.choices[0].message.content;

    return NextResponse.json({
      translation: translatedText,
      sourceLanguage,
      targetLanguage
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Failed to translate text' },
      { status: 500 }
    );
  }
}