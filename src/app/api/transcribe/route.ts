import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/transcriptionService';

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
    
    const result = await transcribeAudio(audioFile);
    console.log('Transcription completed successfully');
    console.log('Transcription text:', result.text);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio', details: String(error) },
      { status: 500 }
    );
  }
}
