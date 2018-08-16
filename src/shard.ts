import { ClashRoyaleClient } from './client/clash-royale-client';
import { ConfigService } from './config/config.service.';
import { InitHelper } from './init-helper';
import { AppLogger } from './util/app-logger';

const config: ConfigService = new ConfigService();
const logger: AppLogger = new AppLogger('Shard');

async function bootstrap(): Promise<void> {
  const { api, emojiHelper } = await InitHelper.init(config);
  const client: ClashRoyaleClient = new ClashRoyaleClient(config, api, emojiHelper);
  client.start();
  client.on('disconnect', () => process.exit(100));
}

const errRegex: RegExp = /ETIMEDOUT|getaddrinfo|Something took too long to do/;
process.on('unhandledRejection', (reason: Error | string) => {
  logger.error('Received unhandled rejection in shard', reason);
  process.exit(200);
});

bootstrap();
