import { Client, Collection, GatewayIntentBits, Interaction, MessageFlags } from "discord.js";
import { config } from "dotenv";
import { readdirSync } from "fs";
import { join } from "path";
import { ChatCommand, MessageCommand, UserCommand } from "./types/commands";
import express from "express";

type Command = ChatCommand | MessageCommand | UserCommand;

config();

class Bot extends Client {
  public commands: Collection<string, Command> = new Collection();

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
  }

  private async loadCommands() {
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
            this.commands.set(command.default.data.name, command.default);
          }
        }
      }
    };

    await loadCommandsFromDir(commandsPath);
  }

  public async start() {
    try {
      await this.loadCommands();

      this.setupProcessHandlers();
      this.setupEventHandlers();
      this.setupHttpServer();

      await this.login(process.env.DISCORD_TOKEN);
    } catch (error) {
      console.error("ボットの起動中にエラーが発生しました:", error);
      process.exit(1);
    }
  }

  private setupProcessHandlers() {
    const handleShutdown = async (signal: string) => {
      console.log(`${signal}を受信しました。ボットをシャットダウンしています...`);
      try {
        await this.destroy();
        process.exit(0);
      } catch (error) {
        console.error("ボットのシャットダウン中にエラーが発生しました:", error);
        process.exit(1);
      }
    };

    process.on("SIGINT", () => handleShutdown("SIGINT"));
    process.on("SIGTERM", () => handleShutdown("SIGTERM"));
    process.on("unhandledRejection", (error) => {
      console.error("予期せぬエラーが発生しました:", error);
    });
  }

  private setupEventHandlers() {
    this.once("ready", () => {
      console.log(`${this.user?.tag}としてログインしました！`);
    });

    this.on("interactionCreate", this.handleInteraction.bind(this));
  }

  private async handleInteraction(interaction: Interaction) {
    if (interaction.isModalSubmit()) {
      console.log("モーダル送信を受信:", interaction.customId);
      const commandName = interaction.customId.split(":")[0];
      console.log("検索するコマンド名:", commandName);
      const command = this.commands.get(commandName);
      console.log("見つかったコマンド:", command?.data.name);
      if (command?.handleModal) {
        try {
          await command.handleModal(interaction);
        } catch (error) {
          console.error(error);
          if (interaction.isRepliable()) {
            await interaction.reply({
              content: "モーダルの処理中にエラーが発生しました。",
              flags: MessageFlags.Ephemeral,
            });
          }
        }
      }
      return;
    }

    if (!interaction.isChatInputCommand() && !interaction.isContextMenuCommand()) return;

    const command = this.commands.get(interaction.commandName);
    if (!command) return;

    try {
      if (interaction.isChatInputCommand()) {
        await (command as ChatCommand).execute(interaction);
      } else if (interaction.isContextMenuCommand()) {
        if (interaction.isMessageContextMenuCommand()) {
          await (command as MessageCommand).execute(interaction);
        } else if (interaction.isUserContextMenuCommand()) {
          await (command as UserCommand).execute(interaction);
        }
      }
    } catch (error) {
      console.error(error);
      if (interaction.isRepliable()) {
        await interaction.reply({
          content: "コマンドの実行中にエラーが発生しました。",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  }

  private setupHttpServer() {
    const app = express();
    const port = process.env.PORT || 3000;

    app.get("/ping", (req, res) => {
      res.send("pong");
    });

    app.listen(port, () => {
      console.log(`HTTPサーバーが${port}番ポートで起動しました`);
    });
  }
}

const bot = new Bot();
bot.start();
