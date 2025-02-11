import { SlashCommandBuilder } from "discord.js";
import { ChatCommand } from "../../types/commands";

const command: ChatCommand = {
  data: new SlashCommandBuilder().setName("ping").setDescription("Replies with Pong!"),
  async execute(interaction) {
    await interaction.reply("Pong!");
  },
};

export default command;
