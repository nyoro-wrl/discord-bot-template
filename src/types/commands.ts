import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ContextMenuCommandBuilder,
  MessageContextMenuCommandInteraction,
  UserContextMenuCommandInteraction,
  ApplicationCommandType,
} from "discord.js";

export interface ChatCommand {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export interface MessageCommand {
  type: ApplicationCommandType.Message;
  data: ContextMenuCommandBuilder;
  execute: (interaction: MessageContextMenuCommandInteraction) => Promise<void>;
}

export interface UserCommand {
  type: ApplicationCommandType.User;
  data: ContextMenuCommandBuilder;
  execute: (interaction: UserContextMenuCommandInteraction) => Promise<void>;
}
