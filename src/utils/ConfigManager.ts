import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

type ConfigScope = "global" | "guild" | "user";

export class ConfigManager {
  private static instance: ConfigManager;
  private configPath: string;
  private config: {
    global: Record<string, any>;
    guilds: Record<string, Record<string, any>>;
    users: Record<string, Record<string, any>>;
  } = {
    global: {},
    guilds: {},
    users: {},
  };

  private constructor() {
    this.configPath = join(process.cwd(), "config", "config.json");
    this.loadConfig();
  }

  public static getGlobal(): GlobalConfig {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return new GlobalConfig(ConfigManager.instance);
  }

  public static getGuild(guildId: string): GuildConfig {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return new GuildConfig(ConfigManager.instance, guildId);
  }

  public static getUser(userId: string): UserConfig {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return new UserConfig(ConfigManager.instance, userId);
  }

  private loadConfig(): void {
    try {
      const configDir = join(process.cwd(), "config");
      if (!existsSync(configDir)) {
        mkdirSync(configDir, { recursive: true });
      }

      const data = readFileSync(this.configPath, "utf8");
      this.config = JSON.parse(data);
    } catch (error) {
      this.saveConfig();
    }
  }

  private saveConfig(): void {
    writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
  }

  public get<T>(key: string, scope: ConfigScope = "global", id?: string, defaultValue?: T): T {
    switch (scope) {
      case "global":
        return this.config.global[key] ?? defaultValue;
      case "guild":
        if (!id) throw new Error("Guild ID is required for guild scope");
        return this.config.guilds[id]?.[key] ?? defaultValue;
      case "user":
        if (!id) throw new Error("User ID is required for user scope");
        return this.config.users[id]?.[key] ?? defaultValue;
    }
  }

  public set(key: string, value: any, scope: ConfigScope = "global", id?: string): void {
    switch (scope) {
      case "global":
        this.config.global[key] = value;
        break;
      case "guild":
        if (!id) throw new Error("Guild ID is required for guild scope");
        if (!this.config.guilds[id]) this.config.guilds[id] = {};
        this.config.guilds[id][key] = value;
        break;
      case "user":
        if (!id) throw new Error("User ID is required for user scope");
        if (!this.config.users[id]) this.config.users[id] = {};
        this.config.users[id][key] = value;
        break;
    }
    this.saveConfig();
  }

  public delete(key: string, scope: ConfigScope = "global", id?: string): void {
    switch (scope) {
      case "global":
        delete this.config.global[key];
        break;
      case "guild":
        if (!id) throw new Error("Guild ID is required for guild scope");
        delete this.config.guilds[id]?.[key];
        break;
      case "user":
        if (!id) throw new Error("User ID is required for user scope");
        delete this.config.users[id]?.[key];
        break;
    }
    this.saveConfig();
  }

  public has(key: string, scope: ConfigScope = "global", id?: string): boolean {
    switch (scope) {
      case "global":
        return key in this.config.global;
      case "guild":
        if (!id) throw new Error("Guild ID is required for guild scope");
        return !!this.config.guilds[id] && key in this.config.guilds[id];
      case "user":
        if (!id) throw new Error("User ID is required for user scope");
        return !!this.config.users[id] && key in this.config.users[id];
    }
  }
}

class GlobalConfig {
  constructor(private manager: ConfigManager) {}

  public get<T>(key: string, defaultValue?: T): T {
    return this.manager.get(key, "global", undefined, defaultValue);
  }

  public set(key: string, value: any): void {
    this.manager.set(key, value, "global");
  }

  public delete(key: string): void {
    this.manager.delete(key, "global");
  }

  public has(key: string): boolean {
    return this.manager.has(key, "global");
  }
}

class GuildConfig {
  constructor(private manager: ConfigManager, private guildId: string) {}

  public get<T>(key: string, defaultValue?: T): T {
    return this.manager.get(key, "guild", this.guildId, defaultValue);
  }

  public set(key: string, value: any): void {
    this.manager.set(key, value, "guild", this.guildId);
  }

  public delete(key: string): void {
    this.manager.delete(key, "guild", this.guildId);
  }

  public has(key: string): boolean {
    return this.manager.has(key, "guild", this.guildId);
  }
}

class UserConfig {
  constructor(private manager: ConfigManager, private userId: string) {}

  public get<T>(key: string, defaultValue?: T): T {
    return this.manager.get(key, "user", this.userId, defaultValue);
  }

  public set(key: string, value: any): void {
    this.manager.set(key, value, "user", this.userId);
  }

  public delete(key: string): void {
    this.manager.delete(key, "user", this.userId);
  }

  public has(key: string): boolean {
    return this.manager.has(key, "user", this.userId);
  }
}
