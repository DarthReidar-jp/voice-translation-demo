import openai from '@/lib/openai';

export async function generateSpeech(text: string, voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'alloy'): Promise<Buffer> {
  // OpenAI Text-to-Speech APIを使用して音声合成
  const mp3 = await openai.audio.speech.create({
    model: 'gpt-4o-mini-tts',
    voice: voice,
    input: text,
    response_format: 'mp3',
  });

  // 音声データをバッファに変換
  const buffer = Buffer.from(await mp3.arrayBuffer());
  return buffer;
}
