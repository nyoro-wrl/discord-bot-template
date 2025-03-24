# Discord Bot Template
TypeScriptを使用した、簡易的なDiscord Botのテンプレート。

## セットアップ
1. [Discord Developer Portal](https://discord.com/developers/applications)でBotを作成
2. .env.exampleをコピーして.envを作成し、そこに各情報を入れる
3. Botを実装

```bash
# パッケージのインストール
npm install
```

## 実行
```bash
# 開発環境
npm run dev
```
```bash
# 本番環境
npm start
```

## コマンドの作成
スラッシュコマンドはsrc/commands/chatに、ユーザーコンテキストメニューはsrc/commands/userに、メッセージコンテキストメニューはsrc/commands/messageにそれぞれ作成する。
