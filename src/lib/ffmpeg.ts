import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

/**
 * FFmpegインスタンスを保持する変数
 */
let ffmpegInstance: FFmpeg | null = null;

/**
 * デバッグログを出力する関数
 * 開発環境でのみログを出力する
 */
const logDebug = (message: string, ...args: unknown[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, ...args);
  }
};

/**
 * ffmpegインスタンスの初期化と読み込み
 * @returns 初期化されたFFmpegインスタンス
 */
const loadFFmpeg = async (): Promise<FFmpeg> => {
  if (ffmpegInstance) {
    return ffmpegInstance;
  }
  
  const ffmpeg = new FFmpeg();
  
  try {
    logDebug('Loading FFmpeg...');
    // コアとWASMファイルのURL
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    
    logDebug('FFmpeg loaded successfully');
    ffmpegInstance = ffmpeg;
    return ffmpeg;
  } catch (error) {
    console.error('FFmpegの読み込みに失敗しました:', error);
    throw new Error(`FFmpegの読み込みに失敗しました: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * オーディオファイルをMP3に変換する関数
 * @param audioBlob 変換するオーディオBlobデータ
 * @returns MP3形式のBlobデータ
 */
export const convertToMp3 = async (audioBlob: Blob): Promise<Blob> => {
  try {
    logDebug('Starting audio conversion to MP3...');
    logDebug('Audio blob type:', audioBlob.type, 'size:', audioBlob.size);
    
    const ffmpeg = await loadFFmpeg();
    
    // 入力ファイルをFFmpegに書き込み
    await ffmpeg.writeFile('input.webm', await fetchFile(audioBlob));
    logDebug('File written to FFmpeg');
    
    // MP3に変換 (より互換性の高いパラメータを使用)
    await ffmpeg.exec([
      '-i', 'input.webm', 
      '-c:a', 'libmp3lame', 
      '-q:a', '2', 
      '-ar', '44100',
      'output.mp3'
    ]);
    logDebug('Conversion completed');
    
    // 変換されたファイルを読み込み
    const data = await ffmpeg.readFile('output.mp3');
    logDebug('MP3 file read, size:', data instanceof Uint8Array ? data.byteLength : 'unknown');
    
    // Uint8ArrayをBlobに変換
    const mp3Blob = new Blob([data], { type: 'audio/mp3' });
    logDebug('MP3 blob created, size:', mp3Blob.size);
    
    return mp3Blob;
  } catch (error) {
    console.error('MP3変換エラー:', error);
    throw new Error(`音声ファイルの変換に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
  }
};
