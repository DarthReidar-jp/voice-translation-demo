import { NextRequest, NextResponse } from 'next/server';
import openai from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    // リクエストからフォームデータを取得
    const formData = await request.formData();
    const audioFile = formData.get('file') as File;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    console.log('Received audio file:', audioFile.name, audioFile.type, audioFile.size);
    
    // OpenAIのTranscription APIでオーディオをテキストに変換
    // language パラメータを完全に省略して自動検出
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'gpt-4o-transcribe'
    });

    console.log('Transcription completed successfully');
    console.log('Transcription text:', transcription.text);
    
    // デフォルト言語を設定
    const detectedLanguage = 'auto';
    
    return NextResponse.json({
      text: transcription.text,
      detectedLanguage: detectedLanguage
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio', details: String(error) },
      { status: 500 }
    );
  }
}