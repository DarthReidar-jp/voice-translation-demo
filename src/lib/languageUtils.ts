/**
 * 言語コードと言語名のマッピング
 */
export const languageMap: { [key: string]: string } = {
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
  'id': 'インドネシア語',
};

/**
 * 言語コードから言語名を取得する
 * @param code 言語コード
 * @returns 言語名
 */
export const getLanguageName = (code: string): string => {
  return languageMap[code] || code;
};
