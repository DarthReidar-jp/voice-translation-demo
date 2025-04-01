import { useState, useRef, useCallback } from 'react';
import { getVoiceForLanguage } from '@/lib/voiceUtils';

/**
 * 音声再生のためのカスタムフック
 */
const useAudio = () => {
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /**
   * テキストを音声に変換して再生する
   * @param text 再生するテキスト
   * @param targetLanguage 対象言語
   */
  const handlePlayAudioWithText = useCallback(async (text: string, targetLanguage: string) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('再生するテキスト:', text.substring(0, 30) + '...');
      }
      
      setIsPlayingAudio(true);
      
      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice: getVoiceForLanguage(targetLanguage),
        }),
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.log('音声API応答ステータス:', response.status);
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`音声の生成に失敗しました (${response.status}): ${errorText}`);
      }
      
      const audioBlob = await response.blob();
      if (process.env.NODE_ENV === 'development') {
        console.log('受信した音声Blobサイズ:', audioBlob.size);
      }
      
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src);
        }
        
        audioRef.current.src = audioUrl;
        audioRef.current.onended = () => setIsPlayingAudio(false);
        if (process.env.NODE_ENV === 'development') {
          console.log('音声再生を開始します');
        }
        audioRef.current.play();
      } else {
        const audio = new Audio(audioUrl);
        audio.onended = () => setIsPlayingAudio(false);
        if (process.env.NODE_ENV === 'development') {
          console.log('新しいAudioオブジェクトで再生を開始します');
        }
        audio.play();
        audioRef.current = audio;
      }
    } catch (error) {
      console.error('音声再生エラー:', error);
      setIsPlayingAudio(false);
      alert('音声の再生に失敗しました: ' + (error instanceof Error ? error.message : String(error)));
    }
  }, []);

  return { isPlayingAudio, handlePlayAudioWithText, audioRef };
};

export default useAudio;
