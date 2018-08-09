import { ShardingManager } from 'discord.js';
import { CRApi } from 'wrap-royale';
import { ClashRoyaleClient } from './client/clash-royale-client';
import { ConfigService } from './config/config.service.';
import { RedisService } from './config/redis.service';
import { EmojiStorage } from './storages/emoji-storage';
import { AppLogger } from './util/app-logger';
import { EmojiHelper } from './util/emoji-helper';

const logger: AppLogger = new AppLogger('Main');
const config: ConfigService = new ConfigService();
const redisService: RedisService = new RedisService(config);
const emojiStorage: EmojiStorage = new EmojiStorage(config, redisService);

async function bootstrap(): Promise<void> {
  logger.info('Starting to initialize the bot');
  await emojiStorage.fetchAvailableEmojis();

  if (config.discord.shardCount > 1) {
    logger.info('Starting to spawn shards');
    const manager: ShardingManager = new ShardingManager('./dist/shard.js', {
      totalShards: config.discord.shardCount,
      token: config.discord.token,
      shardArgs: []
    });
    manager.spawn();
  } else {
    const emojiHelper: EmojiHelper = new EmojiHelper(redisService);
    await emojiHelper.init();
    const api: CRApi = new CRApi(config.crApi.url, config.crApi.token);
    const client: ClashRoyaleClient = new ClashRoyaleClient(config, api, emojiHelper);
    client.start();
  }
}

bootstrap();
