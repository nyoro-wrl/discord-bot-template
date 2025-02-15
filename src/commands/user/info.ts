import { ContextMenuCommandBuilder, ApplicationCommandType, MessageFlags } from "discord.js";
import { UserCommand } from "../../types/commands";

const command: UserCommand = {
  data: new ContextMenuCommandBuilder().setName("Info").setType(ApplicationCommandType.User),

  async execute(interaction) {
    const targetUser = interaction.targetUser;
    const response = [
      `**Info**`,
      `username: ${targetUser.username}`,
      `id: ${targetUser.id}`,
      `createdAt: ${targetUser.createdAt.toLocaleDateString("ja-JP")}`,
    ]
      .filter(Boolean)
      .join("\n");

    await interaction.reply({
      content: response,
      flags: MessageFlags.Ephemeral,
    });
  },
};

export default command;
