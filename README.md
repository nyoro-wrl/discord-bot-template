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
スラッシュコマンドはsrc/commands/chatに、メッセージコンテキストメニューはsrc/commands/messageに、ユーザーコンテキストメニューはsrc/commands/userにそれぞれ作成する。  
コマンドはsrc/types/commands.tsのinterfaceを実装して作成すること。スラッシュコマンドならChatCommand、メッセージコンテキストならMessageCommand、ユーザーコンテキストならUserContext。

## 値の保存
設定値の保存には`ConfigManager`クラスを使用します。グローバル、ギルド、ユーザーの3つのスコープで値を保存できます。

### グローバルスコープ
Bot全体で共有される設定値を保存します。

```typescript
const config = ConfigManager.getGlobal();
config.set("key", "value");
const value = config.get("key");
```

### ギルドスコープ
サーバー（ギルド）ごとの設定値を保存します。

```typescript
const config = ConfigManager.getGuild(interaction);
// または
const config = ConfigManager.getGuildFromId("ギルドID");

config.set("key", "value");
const value = config.get("key");
```

### ユーザースコープ
ユーザーごとの設定値を保存します。

```typescript
const config = ConfigManager.getUser(interaction);
// または
const config = ConfigManager.getUserFromId("ユーザーID");

config.set("key", "value");
const value = config.get("key");
```

設定値は`config/config.json`に保存され、Bot再起動後も維持されます。
