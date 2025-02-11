import { SlashCommandBuilder } from "discord.js";
import { ChatCommand } from "../../types/commands";
import { ConfigManager } from "../../utils/ConfigManager";

const command: ChatCommand = {
  data: new SlashCommandBuilder().setName("count").setDescription("config test"),
  async execute(interaction) {
    const globalConfig = ConfigManager.getGlobal();
    const guildConfig = interaction.guildId
      ? ConfigManager.getGuild(interaction.guildId)
      : undefined;
    const userConfig = ConfigManager.getUser(interaction.user.id);

    const globalCount = globalConfig.get<number>("count", 0) + 1;
    const guildCount = (guildConfig?.get<number>("count", 0) ?? 0) + 1;
    const userCount = userConfig.get<number>("count", 0) + 1;

    globalConfig.set("count", globalCount);
    guildConfig?.set("count", guildCount);
    userConfig.set("count", userCount);

    let content = `Global: ${globalCount}`;
    if (guildConfig) {
      content += `\nGuild: ${guildCount}`;
    }
    content += `\nUser: ${userCount}`;

    await interaction.reply(content);
  },
};

export default command;
