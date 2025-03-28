"use client";
import React, { useState } from 'react';

interface TranslationResultProps {
  originalText: string;
  translatedText: string | null;
  sourceLanguage: string;
  targetLanguage: string;
  isLoading: boolean;
  error: string | null;
  onPlayAudio: () => void;
  isPlayingAudio: boolean;
}

const TranslationResult: React.FC<TranslationResultProps> = ({
  originalText,
  translatedText,
  sourceLanguage,
  targetLanguage,
  isLoading,
  error,
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getLanguageName = (code: string): string => {
    const languageMap: { [key: string]: string } = {
      'en': '英語',
      'ja': '日本語',
      'zh': '中国語',
      'ko': '韓国語',
      'vi': 'ベトナム語',
      'fr': 'フランス語',
      'de': 'ドイツ語',
      'es': 'スペイン語',
      'pt': 'ポルトガル語',
      'ru': 'ロシア語',
      'ar': 'アラビア語',
      'hi': 'ヒンディー語',
      'th': 'タイ語',
    };
    
    return languageMap[code] || code;
  };

  if (!originalText && !isLoading) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl bg-white rounded-lg shadow-md">
      {originalText && (
        <div className="border-b p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-500">
              原文 ({getLanguageName(sourceLanguage)})
            </h3>
            <button
              onClick={() => copyToClipboard(originalText)}
              className="text-gray-400 hover:text-gray-600"
              title="コピー"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
            </button>
          </div>
          <p className="text-gray-700 whitespace-pre-line">{originalText}</p>
        </div>
      )}

      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-500">
            翻訳 ({getLanguageName(targetLanguage)})
          </h3>
          <div className="flex space-x-2">
            {translatedText && (
              <>
                <button
                  onClick={() => copyToClipboard(translatedText)}
                  className="text-gray-400 hover:text-gray-600"
                  title="コピー"
                  disabled={isLoading}
                >
                  {copied ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-2 text-gray-600">翻訳中...</span>
          </div>
        ) : error ? (
          <div className="py-3 px-4 bg-red-50 text-red-700 rounded">
            {error}
          </div>
        ) : translatedText ? (
          <p className="text-gray-700 whitespace-pre-line">{translatedText}</p>
        ) : (
          <p className="text-gray-500 italic">翻訳結果がここに表示されます</p>
        )}
      </div>
    </div>
  );
};

export default TranslationResult;