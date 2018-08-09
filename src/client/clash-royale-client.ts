import { Client, KeyedStorage, Providers, SingleProviderStorage } from '@yamdbf/core';
import { CRApi } from 'wrap-royale';
// tslint:disable-next-line:import-name
import SaveCommand from '../commands/clash-royale/save';
import { ConfigService } from '../config/config.service.';
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
      owner: ['372161181080748038'] // weeco
    });

    this.userSettings = new SingleProviderStorage('user_settings', Providers.MySQLProvider(config.mysql.url));
    this.on('clientReady', this.onReady);
    this.on('pause', this.onPause);
  }

  public start(): this {
    this.logger.info('Started bot client');

    return super.start();
  }

  private onReady(): void {
    const shardId: number = this.shard == null ? 0 : this.shard.id;
    this.logger.info(`Client with shardId #${shardId} is ready`);
  }

  private async onPause(): Promise<void> {
    await this.setDefaultSetting('prefix', '!');
    this.continue();
  }
}
