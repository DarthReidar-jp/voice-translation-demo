import { useState } from 'react';

const useTranslation = () => {
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

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
      setTranslatedText(data.translation);
      
    } catch (error) {
      console.error('翻訳エラー:', error);
      setTranslationError(error instanceof Error ? error.message : '翻訳処理中にエラーが発生しました');
    } finally {
      setIsTranslating(false);
    }
  };

  return { translatedText, isTranslating, translationError, translateText };
};

export default useTranslation;
