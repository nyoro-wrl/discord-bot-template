import { ContextMenuCommandBuilder, ApplicationCommandType, MessageFlags } from "discord.js";
import { MessageCommand } from "../../types/commands";

const command: MessageCommand = {
  data: new ContextMenuCommandBuilder().setName("Copy").setType(ApplicationCommandType.Message),

  async execute(interaction) {
    const targetMessage = interaction.targetMessage;
    await interaction.reply({
      content: targetMessage.content,
      flags: MessageFlags.Ephemeral,
    });
  },
};

export default command;
