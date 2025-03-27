"use client";
import React, { useState, useRef, useEffect } from 'react';
import AudioRecorder from './components/AudioRecorder';
import LanguageSelector from './components/LanguageSelector';
import TranslationResult from './components/TranslationResult';

const HomePage = () => {
  const [sourceLanguage, setSourceLanguage] = useState<string>('');
  const [targetLanguage, setTargetLanguage] = useState<string>('ja');
  const [originalText, setOriginalText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [translationData, setTranslationData] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 音声認識完了時のハンドラー
  const handleTranscriptionComplete = async (text: string, detectedLanguage: string) => {
    setOriginalText(text);
    setSourceLanguage(detectedLanguage);
    
    if (text && targetLanguage) {
      await translateText(text, detectedLanguage, targetLanguage);
    }
  };

  // テキスト翻訳関数
  const translateText = async (text: string, sourceLanguage: string, targetLanguage: string) => {
    try {
      setIsTranslating(true);
      setTranslationError(null);
      
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          sourceLanguage,
          targetLanguage,
        }),
      });
      
      if (!response.ok) {
        throw new Error('翻訳に失敗しました');
      }
      
      const data = await response.json();
      // 一時変数に保存
      const newTranslation = data.translation;
      
      // 状態更新
      setTranslatedText(newTranslation);
      
      // 新しい翻訳を一時的に保存
      setTranslationData(newTranslation);
      
    } catch (error) {
      console.error('翻訳エラー:', error);
      setTranslationError(error instanceof Error ? error.message : '翻訳処理中にエラーが発生しました');
    } finally {
      setIsTranslating(false);
    }
  };

  // translationDataが更新された時に自動再生
  useEffect(() => {
    if (translationData) {
      // 少し遅延を入れる
      const timer = setTimeout(() => {
        handlePlayAudioWithText(translationData);
      }, 500);

      // クリーンアップ
      return () => clearTimeout(timer);
    }
  }, [translationData]);

  // 特定のテキストを再生する関数
  const handlePlayAudioWithText = async (text: string) => {
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
        // 以前のURLがあれば解放
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

  // 元の音声再生関数 (ボタン用)
  const handlePlayAudio = async () => {
    if (translatedText) {
      await handlePlayAudioWithText(translatedText);
    } else {
      console.log('翻訳テキストがありません');
    }
  };

  // 言語に適した音声を選択
  const getVoiceForLanguage = (languageCode: string): string => {
    // OpenAIの声のタイプを言語に応じて選択
    switch (languageCode) {
      case 'ja':
        return 'shimmer'; // 日本語には柔らかい声
      case 'zh':
        return 'echo'; // 中国語には別の声
      default:
        return 'alloy'; // デフォルト
    }
  };

  // TranslationResultに手動で音声再生ボタンを追加
  const renderPlayButton = () => {
    if (!translatedText || isTranslating) return null;
    
    return (
      <div className="mt-4 flex justify-center">
        <button 
          onClick={handlePlayAudio}
          className="px-6 py-2 bg-blue-500 text-white rounded-md flex items-center shadow-sm hover:bg-blue-600 disabled:opacity-50"
          disabled={isPlayingAudio}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          {isPlayingAudio ? '再生中...' : '音声再生'}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 md:p-8">
      <header className="w-full max-w-4xl mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">音声翻訳アプリ</h1>
        <p className="text-gray-600">話した言葉を認識して、選択した言語に翻訳します</p>
      </header>

      <main className="w-full max-w-4xl flex flex-col items-center space-y-8">
        <div className="w-full flex flex-col md:flex-row justify-center items-center gap-4">
          <AudioRecorder
            onTranscriptionComplete={handleTranscriptionComplete}
            onRecordingStart={() => setIsRecording(true)}
            onRecordingStop={() => setIsRecording(false)}
          />
          
          <LanguageSelector
            selectedLanguage={targetLanguage}
            onChange={setTargetLanguage}
            disabled={isRecording || isTranslating}
          />
        </div>

        {(originalText || isTranslating) && (
          <div className="w-full max-w-2xl">
            <TranslationResult
              originalText={originalText}
              translatedText={translatedText}
              sourceLanguage={sourceLanguage}
              targetLanguage={targetLanguage}
              isLoading={isTranslating}
              error={translationError}
              onPlayAudio={handlePlayAudio}
              isPlayingAudio={isPlayingAudio}
            />
            {renderPlayButton()}
          </div>
        )}

        {/* 非表示の音声プレーヤー */}
        <audio ref={audioRef} className="hidden" />
      </main>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>Powered by OpenAI - GPT-4o &amp; TTS API</p>
      </footer>
    </div>
  );
};

export default HomePage;