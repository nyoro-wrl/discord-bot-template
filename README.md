# Discord Bot Template
TypeScriptを使用した、簡易的なDiscord Botのテンプレート。

## プロジェクト構造
開発環境と本番環境でそれぞれ別のBotを使用する設計となっている。  
同じBotを使用すると開発環境用のコマンドと本番環境用のコマンドが重複するため、別のBotにすること。

開発環境上のBotは特定のサーバーのみで実行でき、コマンドが即時反映されるのに対し、本番環境上のBotはどのサーバーでも実行できるが、コマンドの反映が遅い。

```
- src/
  - index.ts            # メインのボットロジック
  - deploy-commands.ts  # コマンドのデプロイ
  - commands/           # コマンドの実装
    - chat/             # スラッシュコマンド
    - message/          # メッセージコンテキストメニューコマンド
    - user/             # ユーザーコンテキストメニューコマンド
  - types/              # 型定義ファイル
    - commands.ts       # コマンドのinterface
  - utils/              # ユーティリティ関数
    - ConfigManager.ts  # 設定値の管理クラス
- .env
- package.json
```

## セットアップ
```bash
# パッケージのインストール
npm install
```

1. [Discord Developer Portal](https://discord.com/developers/applications)でBotを作成
2. .env.exampleをコピーして.envを作成し、そこに各情報を入れる
3. Botを実装し、`npm run dev`で検証
4. Renderなどのサーバーで公開

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
スラッシュコマンドはsrc/commands/chatに、メッセージコンテキストメニューはsrc/commands/messageに、ユーザーコンテキストメニューはsrc/commands/userにそれぞれ作成する。

コマンドはsrc/types/commands.tsのinterfaceを実装して作成すること。  
スラッシュコマンドならChatCommand、メッセージコンテキストならMessageCommand、ユーザーコンテキストならUserContext。

## 値の保存
設定値の保存には`ConfigManager`クラスを使用。グローバル、ギルド、ユーザーの3つのスコープで値を保存できる。

### グローバルスコープ
Bot全体で共有される設定値。

```typescript
const config = ConfigManager.getGlobal();
config.set("key", "value");
const value = config.get("key");
```

### ギルドスコープ
サーバー（ギルド）ごとの設定値。

```typescript
const config = ConfigManager.getGuild(interaction);
// または
const config = ConfigManager.getGuildFromId("ギルドID");

config.set("key", "value");
const value = config.get("key");
```

### ユーザースコープ
ユーザーごとの設定値。

```typescript
const config = ConfigManager.getUser(interaction);
// または
const config = ConfigManager.getUserFromId("ユーザーID");

config.set("key", "value");
const value = config.get("key");
```

設定値は`config/config.json`に保存され、Bot再起動後も維持される。
