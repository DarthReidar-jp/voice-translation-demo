# 音声翻訳アプリ

このプロジェクトは、リアルタイムの音声録音と翻訳機能を提供するNext.jsベースのウェブアプリケーションです。ユーザーは音声を録音し、異なる言語に翻訳することができます。

## 機能

- ブラウザ内での音声録音
- 録音した音声の自動翻訳
- 複数の翻訳言語をサポート（現在はベトナム語、英語、中国語）
- シンプルで使いやすいインターフェース

## 技術スタック

- **フロントエンド**: Next.js 15.2.4, React 19, TypeScript, Tailwind CSS
- **API**: Next.js API Routes
- **音声処理**: gpt-4o-transcribe,gpt-4o-mini-tts

## 始め方

### 前提条件

- Node.js 18.x以上
- npmまたはyarnまたはpnpmまたはbun

### インストール

```bash
# リポジトリをクローン
git clone [リポジトリURL]
cd voice-translation-demo

# 依存関係のインストール
npm install
# または
yarn install
# または
pnpm install
# または
bun install
```

### 開発サーバーの実行

```bash
npm run dev
# または
yarn dev
# または
pnpm dev
# または
bun dev
```

ブラウザで[http://localhost:3000](http://localhost:3000)を開くと、アプリケーションが表示されます。

## 使い方

1. 「Start Recording」ボタンをクリックして音声録音を開始します
2. 翻訳したい言語を選択します
3. 「Stop Recording」ボタンをクリックして録音を終了します
4. 録音が終了すると自動的に翻訳処理が開始されます
5. 翻訳結果がページに表示されます

## 開発ロードマップ

### 第1フェーズ: 基本機能の完成（短期）

- [ ] 音声認識APIの実装（gpt-4o-mini-transcribe）
- [ ] テキスト読み上げの実装(GPT-4o mini TTS)
- [ ] 翻訳APIの実装（gpt-4o）
- [ ] フロントエンドとAPIの連携
- [ ] 基本的なUIデザインの改善

