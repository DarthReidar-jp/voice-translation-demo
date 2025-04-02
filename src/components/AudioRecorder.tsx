"use client";
import React, { useEffect } from 'react';
import { useAudioRecorder } from '@/app/hooks/useAudioRecorder';

interface AudioRecorderProps {
  onTranscriptionComplete: (text: string, detectedLanguage: string) => void;
  onRecordingStart: () => void;
  onRecordingStop: () => void;
}

/**
 * 音声録音コンポーネント
 * 録音の開始・停止と音声認識を行う
 */
const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onTranscriptionComplete,
  onRecordingStart,
  onRecordingStop
}) => {
  const {
    isRecording,
    isProcessing,
    audioURL,
    error,
    debugMessages,
    handleStartRecording,
    handleStopRecording
  } = useAudioRecorder({
    onTranscriptionComplete,
    onRecordingStart,
    onRecordingStop
  });

  // コンポーネントのアンマウント時にリソースをクリーンアップ
  useEffect(() => {
    return () => {
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
      
      {debugMessages.length > 0 && (
        <div className="mt-4 p-3 bg-gray-100 text-gray-700 rounded-md w-full text-xs font-mono overflow-auto max-h-40">
          <p className="font-medium mb-1">デバッグ情報:</p>
          {debugMessages.map((msg: string, i: number) => (
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
