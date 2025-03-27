"use client";
import React, { useState, useRef, useEffect } from 'react';
import { convertToMp3 } from '@/lib/ffmpeg';

interface AudioRecorderProps {
  onTranscriptionComplete: (text: string, detectedLanguage: string) => void;
  onRecordingStart: () => void;
  onRecordingStop: () => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onTranscriptionComplete,
  onRecordingStart,
  onRecordingStop
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const addDebugMessage = (message: string) => {
    console.log(message);
    setDebug(prev => [...prev, message]);
  };

  // 録音開始ハンドラー
  const handleStartRecording = async () => {
    try {
      setError(null);
      setDebug([]);
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
          
          // 録音データをBlobに結合
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          addDebugMessage(`音声Blobが作成されました (サイズ: ${audioBlob.size} bytes, タイプ: ${audioBlob.type})`);
          
          const url = URL.createObjectURL(audioBlob);
          setAudioURL(url);
          
          // MP3に変換
          addDebugMessage("MP3への変換を開始します...");
          let mp3Blob;
          try {
            mp3Blob = await convertToMp3(audioBlob);
            addDebugMessage(`MP3への変換が完了しました (サイズ: ${mp3Blob.size} bytes)`);
          } catch (error) {
            addDebugMessage(`MP3変換エラー: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
          }
          
          // FormDataを作成
          const formData = new FormData();
          formData.append('file', mp3Blob, 'audio.mp3');
          addDebugMessage("FormDataを作成し、APIリクエストを準備しました");
          
          // 音声認識APIにリクエスト
          addDebugMessage("音声認識APIにリクエストを送信します...");
          try {
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
            
            // 親コンポーネントに認識結果を通知
            onTranscriptionComplete(
              transcriptionData.text, 
              transcriptionData.detectedLanguage || 'auto'
            );
          } catch (error) {
            addDebugMessage(`APIリクエストエラー: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
          }
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
  };

  // 録音停止ハンドラー
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      addDebugMessage("録音を停止中...");
      mediaRecorderRef.current.stop();
      
      // すべてのトラックを停止
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        addDebugMessage("メディアトラックが停止しました");
      }
      
      setIsRecording(false);
      onRecordingStop();
    }
  };

  // コンポーネントのアンマウント時にリソースをクリーンアップ
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        if (mediaRecorderRef.current.stream) {
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
      }
      
      // 作成したURLオブジェクトを開放
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  return (
    <div className="flex flex-col items-center w-full max-w-md">
      <button
        onClick={isRecording ? handleStopRecording : handleStartRecording}
        disabled={isProcessing}
        className={`px-6 py-3 rounded-full font-medium text-white transition-colors ${
          isRecording 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-blue-500 hover:bg-blue-600'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isProcessing ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            処理中...
          </span>
        ) : isRecording ? '録音停止' : '録音開始'}
      </button>

      {audioURL && (
        <div className="mt-4 w-full">
          <audio 
            controls 
            src={audioURL} 
            className="w-full"
          >
            お使いのブラウザは音声再生をサポートしていません。
          </audio>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md w-full">
          <p className="font-medium">エラー:</p>
          <p>{error}</p>
        </div>
      )}
      
      {debug.length > 0 && (
        <div className="mt-4 p-3 bg-gray-100 text-gray-700 rounded-md w-full text-xs font-mono overflow-auto max-h-40">
          <p className="font-medium mb-1">デバッグ情報:</p>
          {debug.map((msg, i) => (
            <div key={i} className="py-1 border-t border-gray-200 first:border-t-0">
              {msg}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;