import {
  REST,
  Routes,
  RESTPostAPIApplicationCommandsJSONBody,
  ApplicationCommandType,
} from "discord.js";
import { config } from "dotenv";
import { readdirSync } from "fs";
import { join } from "path";

config();

// 環境に応じたプレフィックスを選択
const ENV_PREFIX = process.env.NODE_ENV === "production" ? "PROD_" : "DEV_";
const BOT_TOKEN = process.env[`${ENV_PREFIX}BOT_TOKEN`];
const APPLICATION_ID = process.env[`${ENV_PREFIX}APPLICATION_ID`];
// 開発環境でのみGUILD_IDを使用
const GUILD_ID = process.env.NODE_ENV === "development" ? process.env.DEV_GUILD_ID : undefined;

const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];
const processedCommands = new Set<string>();
const commandsPath = join(__dirname, "commands");

const loadCommandsFromDir = async (dirPath: string) => {
  const entries = readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);
    if (entry.isDirectory()) {
      await loadCommandsFromDir(fullPath);
    } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".js")) {
      const command = await import(fullPath);
      if ("default" in command && "data" in command.default && "execute" in command.default) {
        const commandName = command.default.data.name;
        if (!processedCommands.has(commandName)) {
          processedCommands.add(commandName);
          commands.push(command.default.data.toJSON());
        }
      }
    }
  }
};

const rest = new REST().setToken(BOT_TOKEN!);

(async () => {
  try {
    await loadCommandsFromDir(commandsPath);

    console.log(`現在の環境: ${process.env.NODE_ENV}`);
    console.log(`登録予定のコマンド数: ${commands.length}`);

    // コマンド名の一覧を表示（タイプ付き）
    commands.forEach((cmd) => {
      const displayName = (() => {
        switch (cmd.type) {
          case ApplicationCommandType.ChatInput:
            return `/${cmd.name}`;
          case ApplicationCommandType.User:
            return `User.${cmd.name}`;
          case ApplicationCommandType.Message:
            return `Message.${cmd.name}`;
          default:
            return cmd.name;
        }
      })();
      console.log(`- ${displayName}`);
    });

    if (process.env.NODE_ENV === "development") {
      // 開発環境の場合、ギルドコマンドとして登録
      console.log("開発環境: ギルドコマンドを登録中...");
      const data = await rest.put(Routes.applicationGuildCommands(APPLICATION_ID!, GUILD_ID!), {
        body: commands,
      });
      console.log(`${(data as any[]).length} 個のコマンドをギルドコマンドとして登録しました！`);
    } else {
      // 本番環境の場合、グローバルコマンドとして登録
      console.log("本番環境: グローバルコマンドを登録中...");
      const data = await rest.put(Routes.applicationCommands(APPLICATION_ID!), {
        body: commands,
      });
      console.log(`${(data as any[]).length} 個のコマンドをグローバルコマンドとして登録しました！`);
    }
  } catch (error) {
    console.error("コマンドの登録中にエラーが発生しました:", error);
  }
})();
