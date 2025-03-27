import { NextRequest, NextResponse } from 'next/server';
import openai from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'alloy' } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    console.log('TTS Request:', { text: text.substring(0, 50) + '...', voice });

    // OpenAI Text-to-Speech APIを使用して音声合成
    const mp3 = await openai.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice: voice,
      input: text,
      response_format: 'mp3',
    });

    console.log('TTS completed successfully');

    // 音声データをバッファに変換
    const buffer = Buffer.from(await mp3.arrayBuffer());
    console.log('Audio buffer created, size:', buffer.length);

    // 音声データを含むレスポンスを返す
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Text-to-speech error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech', details: String(error) },
      { status: 500 }
    );
  }
}