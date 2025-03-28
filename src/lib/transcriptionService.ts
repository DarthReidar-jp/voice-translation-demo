import openai from '@/lib/openai';

export async function transcribeAudio(audioFile: File): Promise<{ text: string; detectedLanguage: string }> {
  // OpenAIのTranscription APIでオーディオをテキストに変換
  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: 'gpt-4o-transcribe'
  });

  // デフォルト言語を設定
  const detectedLanguage = 'auto';
  
  return {
    text: transcription.text,
    detectedLanguage: detectedLanguage
  };
}
