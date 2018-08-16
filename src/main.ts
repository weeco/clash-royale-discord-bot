import { ShardingManager } from 'discord.js';
import { ClashRoyaleClient } from './client/clash-royale-client';
import { ConfigService } from './config/config.service.';
import { InitHelper } from './init-helper';
import { AppLogger } from './util/app-logger';

const logger: AppLogger = new AppLogger('Main');
const config: ConfigService = new ConfigService();

async function bootstrap(): Promise<void> {
  logger.info('Starting to initialize the bot');

  if (config.discord.shardCount > 1) {
    logger.info('Starting to spawn shards');
    const manager: ShardingManager = new ShardingManager('./dist/shard.js', {
      totalShards: config.discord.shardCount,
      token: config.discord.token,
      shardArgs: [],
      respawn: true
    });
    manager.spawn();
  } else {
    const { api, emojiHelper } = await InitHelper.init(config);
    const client: ClashRoyaleClient = new ClashRoyaleClient(config, api, emojiHelper);
    client.start();
  }
}

bootstrap();
