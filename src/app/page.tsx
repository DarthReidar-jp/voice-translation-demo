"use client";
import React, { useEffect, useState } from 'react';
import AudioRecorder from './components/AudioRecorder';
import LanguageSelector from './components/LanguageSelector';
import TranslationResult from './components/TranslationResult';
import Header from './components/Header';
import Footer from './components/Footer';
import useTranslation from './hooks/useTranslation';
import useAudio from './hooks/useAudio';

const HomePage = () => {
  const [sourceLanguage, setSourceLanguage] = useState<string>('');
  const [targetLanguage, setTargetLanguage] = useState<string>('ja');
  const [originalText, setOriginalText] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const { translatedText, isTranslating, translationError, translateText } = useTranslation();
  const { isPlayingAudio, handlePlayAudioWithText, audioRef } = useAudio();

  // 音声認識完了時のハンドラー
  const handleTranscriptionComplete = async (text: string, detectedLanguage: string) => {
    setOriginalText(text);
    setSourceLanguage(detectedLanguage);
    
    if (text && targetLanguage) {
      await translateText(text, detectedLanguage, targetLanguage);
    }
  };


  // TranslationResultに手動で音声再生ボタンを追加
  const renderPlayButton = () => {
    if (!translatedText || isTranslating) return null;
    
    return (
      <div className="mt-4 flex justify-center">
        <button 
          onClick={() => handlePlayAudioWithText(translatedText, targetLanguage)}
          className="px-6 py-2 bg-blue-500 text-white rounded-md flex items-center shadow-sm hover:bg-blue-600 disabled:opacity-50"
          disabled={isPlayingAudio}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          {isPlayingAudio ? '再生中...' : '翻訳音声再生'}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 md:p-8">
      <Header />

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
              onPlayAudio={() => translatedText && handlePlayAudioWithText(translatedText, targetLanguage)}
              isPlayingAudio={isPlayingAudio}
            />
            {renderPlayButton()}
          </div>
        )}

        {/* 非表示の音声プレーヤー */}
        <audio ref={audioRef} className="hidden" />
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
