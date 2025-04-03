"use client";
import React from 'react';

interface Language {
  code: string;
  name: string;
}

const languages: Language[] = [
  { code: 'en', name: '英語 (English)' },
  { code: 'ja', name: '日本語 (Japanese)' },
  { code: 'zh', name: '中国語 (Chinese)' },
  { code: 'ko', name: '韓国語 (Korean)' },
  { code: 'vi', name: 'ベトナム語 (Vietnamese)' },
  { code: 'fr', name: 'フランス語 (French)' },
  { code: 'de', name: 'ドイツ語 (German)' },
  { code: 'es', name: 'スペイン語 (Spanish)' },
  { code: 'pt', name: 'ポルトガル語 (Portuguese)' },
  { code: 'ru', name: 'ロシア語 (Russian)' },
  { code: 'ar', name: 'アラビア語 (Arabic)' },
  { code: 'hi', name: 'ヒンディー語 (Hindi)' },
  { code: 'th', name: 'タイ語 (Thai)' },
  { code: 'id', name: 'インドネシア語 (Indonesian)' },
];

interface LanguageSelectorProps {
  selectedLanguage: string;
  onChange: (languageCode: string) => void;
  disabled?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onChange,
  disabled = false
}) => {
  return (
    <div className="w-full max-w-xs">
      <label 
        htmlFor="language-select" 
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        翻訳先言語
      </label>
      <select
        id="language-select"
        value={selectedLanguage}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
        }`}
      >
        {languages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;