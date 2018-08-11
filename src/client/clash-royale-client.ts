import { Client, Guild, KeyedStorage, Message, Providers, SingleProviderStorage } from '@yamdbf/core';
import { MessageEmbed, TextChannel } from 'discord.js';
import { CRApi } from 'wrap-royale';
import { ConfigService } from '../config/config.service.';
import { checkChannelPermissions } from '../middlewares/channel-permissions';
import { AppLogger } from '../util/app-logger';
import { EmojiHelper } from '../util/emoji-helper';

export class ClashRoyaleClient extends Client {
  public userSettings: KeyedStorage;
  private logger: AppLogger = new AppLogger('ClashRoyaleClient');

  constructor(public config: ConfigService, public crApi: CRApi, public emojiHelper: EmojiHelper) {
    super({
      token: config.discord.token,
      statusText: 'DM me for help!',
      readyText: 'Ready',
      localeDir: './locale',
      ratelimit: '10/1m',
      unknownCommandError: false,
      provider: Providers.MySQLProvider(config.mysql.url),
      dmHelp: true,
      commandsDir: './dist/commands',
      pause: true,
      owner: ['372161181080748038'] // weeco
    });

    this.userSettings = new SingleProviderStorage('user_settings', Providers.MySQLProvider(config.mysql.url));

    // Attach middleware
    // tslint:disable-next-line:no-any
    this.use((message: Message, args: any[]) => checkChannelPermissions(message, args, this));

    // Bind discord events
    this.on('clientReady', this.onReady);
    this.on('pause', this.onPause);
    this.on('warn', this.onDiscordWarning);
    this.on('error', this.onDiscordError);
    this.on('disconnect', this.onDisconnect);
    this.on('reconnecting', this.onReconnecting);
    this.on('guildCreate', this.onGuildAction);
    this.on('guildDelete', this.onGuildAction);
    this.on('guildUnavailable', this.onGuildUnavailable);
  }

  public start(): this {
    this.logger.info('Started bot client');

    return super.start();
  }

  private onReady(): void {
    const shardId: number = this.shard == null ? 0 : this.shard.id;
    this.logger.info(`Client with shardId #${shardId} is ready`);
  }

  /**
   * Log guild join/leave to guild logging channel
   */
  private onGuildAction(guild: Guild, joined: boolean = true): void {
    const logChannel: TextChannel = <TextChannel>this.channels.get(this.config.discord.adminChannelId);
    const embed: MessageEmbed = new MessageEmbed()
      .setColor(joined ? 8450847 : 13091073)
      .setAuthor(`${guild.name} (${guild.id})`, guild.iconURL())
      .setFooter(joined ? 'Joined guild' : 'Left guild')
      .setDescription(`Guildmembers: ${guild.memberCount}`)
      .setTimestamp();

    logChannel.send({ embed });
  }

  private onDisconnect(): void {
    this.logger.warn('Disconnecting from shard');
  }

  private onReconnecting(): void {
    this.logger.warn('Reconnecting to shard');
  }

  private onGuildUnavailable(guild: Guild): void {
    this.logger.info(`Guild ${guild.name} is currently unavailable`);
  }

  private onDiscordWarning(info: string): void {
    this.logger.warn(`Discord warning: ${info}`);
  }

  private onDiscordError(info: string): void {
    this.logger.warn(`Discord warning: ${info}`);
  }

  private async onPause(): Promise<void> {
    await this.setDefaultSetting('prefix', '!');
    this.continue();
  }
}
