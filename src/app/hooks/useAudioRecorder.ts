import { useState, useRef, useCallback } from 'react';
import { convertToMp3 } from '../../lib/ffmpeg';

interface UseAudioRecorderProps {
  onTranscriptionComplete: (text: string, detectedLanguage: string) => void;
  onRecordingStart: () => void;
  onRecordingStop: () => void;
}

interface UseAudioRecorderReturn {
  isRecording: boolean;
  isProcessing: boolean;
  audioURL: string | null;
  error: string | null;
  debugMessages: string[];
  handleStartRecording: () => Promise<void>;
  handleStopRecording: () => void;
}

/**
 * 音声録音と処理のためのカスタムフック
 */
export const useAudioRecorder = ({
  onTranscriptionComplete,
  onRecordingStart,
  onRecordingStop
}: UseAudioRecorderProps): UseAudioRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugMessages, setDebugMessages] = useState<string[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const addDebugMessage = useCallback((message: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(message);
    }
    setDebugMessages(prev => [...prev, message]);
  }, []);

  const handleStartRecording = useCallback(async () => {
    try {
      setError(null);
      setDebugMessages([]);
      audioChunksRef.current = [];
      addDebugMessage("録音を開始します...");
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('お使いのブラウザは音声録音をサポートしていません');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      addDebugMessage("マイクのアクセス許可を取得しました");
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      addDebugMessage(`MediaRecorderが作成されました (mimeType: ${mediaRecorder.mimeType})`);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          addDebugMessage(`音声データを受信しました (サイズ: ${event.data.size} bytes)`);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          setIsProcessing(true);
          addDebugMessage("録音が停止しました。音声処理を開始します...");
          
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          addDebugMessage(`音声Blobが作成されました (サイズ: ${audioBlob.size} bytes, タイプ: ${audioBlob.type})`);
          
          const url = URL.createObjectURL(audioBlob);
          setAudioURL(url);
          
          addDebugMessage("MP3への変換を開始します...");
          const mp3Blob = await convertToMp3(audioBlob);
          addDebugMessage(`MP3への変換が完了しました (サイズ: ${mp3Blob.size} bytes)`);
          
          const formData = new FormData();
          formData.append('file', mp3Blob, 'audio.mp3');
          addDebugMessage("FormDataを作成し、APIリクエストを準備しました");
          
          addDebugMessage("音声認識APIにリクエストを送信します...");
          const transcriptionResponse = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });
          
          addDebugMessage(`APIレスポンス: ${transcriptionResponse.status} ${transcriptionResponse.statusText}`);
          
          if (!transcriptionResponse.ok) {
            const errorText = await transcriptionResponse.text();
            addDebugMessage(`APIエラー詳細: ${errorText}`);
            throw new Error(`音声認識に失敗しました (${transcriptionResponse.status}): ${errorText}`);
          }
          
          const transcriptionData = await transcriptionResponse.json();
          addDebugMessage(`認識結果を受信しました: "${transcriptionData.text.substring(0, 30)}..."`);
          
          onTranscriptionComplete(
            transcriptionData.text, 
            transcriptionData.detectedLanguage || 'auto'
          );
        } catch (error) {
          console.error('録音処理エラー:', error);
          setError(error instanceof Error ? error.message : '音声処理中にエラーが発生しました');
          addDebugMessage(`処理エラー: ${error instanceof Error ? error.message : '音声処理中にエラーが発生しました'}`);
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      onRecordingStart();
      addDebugMessage("録音が開始されました");
    } catch (error) {
      console.error('録音開始エラー:', error);
      setError(error instanceof Error ? error.message : '録音の開始に失敗しました');
      addDebugMessage(`録音開始エラー: ${error instanceof Error ? error.message : '録音の開始に失敗しました'}`);
    }
  }, [addDebugMessage, onRecordingStart, onTranscriptionComplete]);

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      addDebugMessage("録音を停止中...");
      mediaRecorderRef.current.stop();
      
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        addDebugMessage("メディアトラックが停止しました");
      }
      
      setIsRecording(false);
      onRecordingStop();
    }
  }, [addDebugMessage, isRecording, onRecordingStop]);

  const cleanup = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
    
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
  }, [audioURL]);

  return {
    isRecording,
    isProcessing,
    audioURL,
    error,
    debugMessages,
    handleStartRecording,
    handleStopRecording
  };
};
