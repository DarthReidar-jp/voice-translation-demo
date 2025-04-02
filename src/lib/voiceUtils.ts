/**
 * 言語コードに基づいて適切な音声を取得する
 * @param languageCode 言語コード
 * @returns 音声識別子
 */
export const getVoiceForLanguage = (languageCode: string): string => {
  switch (languageCode) {
    case 'ja':
      return 'shimmer';
    case 'zh':
      return 'echo';
    default:
      return 'alloy';
  }
};
