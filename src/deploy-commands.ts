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

const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

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
            return `user.${cmd.name}`;
          case ApplicationCommandType.Message:
            return `message.${cmd.name}`;
          default:
            return cmd.name;
        }
      })();
      console.log(`- ${displayName}`);
    });

    if (process.env.NODE_ENV === "development") {
      // 開発環境の場合、まずグローバルコマンドを削除
      console.log("開発環境: グローバルコマンドを削除中...");
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), { body: [] });
      console.log("グローバルコマンドを削除しました");

      // ギルドコマンドとして登録
      const data = await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.GUILD_ID!),
        { body: commands }
      );
      console.log(`${(data as any[]).length} 個のコマンドをギルドコマンドとして登録しました！`);
    } else {
      const data = await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
        body: commands,
      });
      console.log(`${(data as any[]).length} 個のコマンドをグローバルコマンドとして登録しました！`);
    }
  } catch (error) {
    console.error("コマンドの登録中にエラーが発生しました:", error);
  }
})();
