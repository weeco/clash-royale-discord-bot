import { CRApi } from 'wrap-royale';
import { ClashRoyaleClient } from './client/clash-royale-client';
import { ConfigService } from './config/config.service.';
import { RedisService } from './config/redis.service';
import { AppLogger } from './util/app-logger';
import { EmojiHelper } from './util/emoji-helper';

const config: ConfigService = new ConfigService();
const redisService: RedisService = new RedisService(config);
const logger: AppLogger = new AppLogger('Shard');

async function bootstrap(): Promise<void> {
  const emojiHelper: EmojiHelper = new EmojiHelper(redisService);
  await emojiHelper.init();
  const api: CRApi = new CRApi(config.crApi.url, config.crApi.token);
  const client: ClashRoyaleClient = new ClashRoyaleClient(config, api, emojiHelper);
  client.start();
  client.on('disconnect', () => process.exit(100));
}

const errRegex: RegExp = /ETIMEDOUT|getaddrinfo|Something took too long to do/;
process.on('unhandledRejection', (reason: Error | string) => {
  if (errRegex.test(<string>reason)) {
    process.exit(200);
  } else {
    logger.error('Received unhandled rejection in shard', reason);
  }
});

bootstrap();
