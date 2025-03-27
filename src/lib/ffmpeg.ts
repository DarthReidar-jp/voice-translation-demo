import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

// FFmpegインスタンスを保持する変数
let ffmpegInstance: FFmpeg | null = null;

// ffmpegインスタンスの初期化と読み込み
const loadFFmpeg = async (): Promise<FFmpeg> => {
  if (ffmpegInstance) {
    return ffmpegInstance;
  }
  
  const ffmpeg = new FFmpeg();
  
  try {
    console.log('Loading FFmpeg...');
    // コアとWASMファイルのURL
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    
    console.log('FFmpeg loaded successfully');
    ffmpegInstance = ffmpeg;
    return ffmpeg;
  } catch (error) {
    console.error('FFmpegの読み込みに失敗しました:', error);
    throw error;
  }
};

// オーディオファイルをMP3に変換する関数
export const convertToMp3 = async (audioBlob: Blob): Promise<Blob> => {
  try {
    console.log('Starting audio conversion to MP3...');
    console.log('Audio blob type:', audioBlob.type, 'size:', audioBlob.size);
    
    const ffmpeg = await loadFFmpeg();
    
    // 入力ファイルをFFmpegに書き込み
    await ffmpeg.writeFile('input.webm', await fetchFile(audioBlob));
    console.log('File written to FFmpeg');
    
    // MP3に変換 (より互換性の高いパラメータを使用)
    await ffmpeg.exec([
      '-i', 'input.webm', 
      '-c:a', 'libmp3lame', 
      '-q:a', '2', 
      '-ar', '44100',
      'output.mp3'
    ]);
    console.log('Conversion completed');
    
    // 変換されたファイルを読み込み
    const data = await ffmpeg.readFile('output.mp3');
    console.log('MP3 file read, size:', data instanceof Uint8Array ? data.byteLength : 'unknown');
    
    // Uint8ArrayをBlobに変換
    const mp3Blob = new Blob([data], { type: 'audio/mp3' });
    console.log('MP3 blob created, size:', mp3Blob.size);
    
    return mp3Blob;
  } catch (error) {
    console.error('MP3変換エラー:', error);
    throw new Error('音声ファイルの変換に失敗しました: ' + error);
  }
};