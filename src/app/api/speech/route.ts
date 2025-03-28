import { NextRequest, NextResponse } from 'next/server';
import { generateSpeech } from '@/lib/speechService';

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

    const buffer = await generateSpeech(text, voice);
    console.log('TTS completed successfully, Audio buffer created, size:', buffer.length);

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
