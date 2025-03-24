import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";
import { ChatCommand } from "../../types/commands";

const command: ChatCommand = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Botの使い方を表示します。")
    .setDescriptionLocalization("ja", "Botの使い方を表示します。"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("Discord Bot Template - ヘルプ")
      .setDescription("DiscordのBotを作るためのテンプレートです。");

    await interaction.reply({
      embeds: [embed],
    });
  },
};

export default command;
