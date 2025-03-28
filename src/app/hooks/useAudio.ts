import { useState, useRef } from 'react';

const useAudio = () => {
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayAudioWithText = async (text: string, targetLanguage: string) => {
    try {
      console.log('再生するテキスト:', text.substring(0, 30) + '...');
      
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
      
      console.log('音声API応答ステータス:', response.status);
      
      if (!response.ok) {
        throw new Error('音声の生成に失敗しました');
      }
      
      const audioBlob = await response.blob();
      console.log('受信した音声Blobサイズ:', audioBlob.size);
      
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src);
        }
        
        audioRef.current.src = audioUrl;
        audioRef.current.onended = () => setIsPlayingAudio(false);
        console.log('音声再生を開始します');
        audioRef.current.play();
      } else {
        const audio = new Audio(audioUrl);
        audio.onended = () => setIsPlayingAudio(false);
        console.log('新しいAudioオブジェクトで再生を開始します');
        audio.play();
        audioRef.current = audio;
      }
    } catch (error) {
      console.error('音声再生エラー:', error);
      setIsPlayingAudio(false);
      alert('音声の再生に失敗しました: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const getVoiceForLanguage = (languageCode: string): string => {
    switch (languageCode) {
      case 'ja':
        return 'shimmer';
      case 'zh':
        return 'echo';
      default:
        return 'alloy';
    }
  };

  return { isPlayingAudio, handlePlayAudioWithText, audioRef };
};

export default useAudio;
