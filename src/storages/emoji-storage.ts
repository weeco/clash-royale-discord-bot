import { Emoji } from 'discord.js';
import { RequestAPI, RequestResponse, RequiredUriUrl } from 'request';
import requestPromise from 'request-promise';
import { ConfigService } from '../config/config.service.';
import { RedisService } from '../config/redis.service';
import { AppLogger } from '../util/app-logger';
import { sleep } from '../util/sleep';

export class EmojiStorage {
  private readonly emojiServers: string[] = [
    '303593339175960577',
    '303594018468528138',
    '303589385654239234',
    '389183651562389517',
    '389185911058857986',
    '389189881932283904',
    '389189948907192330',
    '389190097259724802'
  ];
  private apiRequest: RequestAPI<requestPromise.RequestPromise, requestPromise.RequestPromiseOptions, RequiredUriUrl>;
  private logger: AppLogger;
  private emojiMap: Map<string, Emoji> = new Map();

  constructor(private config: ConfigService, private redis: RedisService) {
    this.logger = new AppLogger('EmojiStorage');
    this.apiRequest = requestPromise.defaults({
      baseUrl: 'https://discordapp.com/api/v6',
      method: 'GET',
      encoding: 'utf8',
      gzip: true,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'DiscordBot (https://discordapp.com/api/v6, 6)',
        Authorization: `Bot ${config.discord.token}`
      },
      json: true,
      timeout: 4000,
      resolveWithFullResponse: true,
      pool: { maxSockets: Infinity }
    });
  }

  /**
   * Fetch all emojis in the given guilds directly from the Discord API
   */
  public async fetchAvailableEmojis(): Promise<string> {
    this.logger.info('Fetching list of available emojis');
    let cachedEmojis: Emoji[] = [];
    for (const guildId of this.emojiServers) {
      const emojis: Emoji[] = await this.requestEmojis(guildId);
      cachedEmojis = cachedEmojis.concat(emojis);
      this.logger.info(
        `Fetched available emojis for guild '${guildId}', found and upserted '${emojis.length}' emojis into redis.`
      );
    }
    this.logger.info(
      `Successfully fetched all available emojis. In total '${cachedEmojis.length}' emojis have been fetched`
    );

    return this.redis.setEmojis(cachedEmojis);
  }

  /**
   * Fetch available emojis under respect of the rate limit
   */
  private async requestEmojis(guildId: string): Promise<Emoji[]> {
    const route: string = `guilds/${guildId}/emojis`;
    const response: RequestResponse = await this.apiRequest.get(route);

    const rateLimitKey: string = 'X-RateLimit-Remaining';
    const rateLimitResetKey: string = 'X-RateLimit-Reset';
    const tokensRemaining: number = response.headers[rateLimitKey]
      ? parseInt(response.headers[rateLimitKey][0], 10)
      : null;
    if (tokensRemaining != null && tokensRemaining === 0) {
      this.logger.info(
        `No request tokens remaining anymore, going to throttle until ${response.headers[rateLimitResetKey]}`
      );
      await sleep(3 * 1000);
    }

    return response.body;
  }
}
