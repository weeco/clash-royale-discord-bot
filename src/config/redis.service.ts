/**
 * Export redis and it's getters / setters
 */
import { Emoji } from 'discord.js';
import { default as Redis } from 'ioredis';
import { AppLogger } from '../util/app-logger';
import { ConfigService } from './config.service.';

export class RedisService extends Redis {
  private logger: AppLogger;

  /**
   * Call Parent class constructor
   */
  constructor(private configService: ConfigService) {
    super(configService.redis.url);
    this.logger = new AppLogger('RedisService');
    this.logger.info('Connecting to redis server');
    this.on('connect', this.onConnected);
    this.on('error', this.onError);
    this.on('close', this.onClosed);
  }

  /**
   * Upserts the emojis into redis.
   * @param emojis All emojis from the emoji servers which are available for our bot.
   */
  public async setEmojis(emojis: Emoji[]): Promise<string> {
    return this.set('emojis', JSON.stringify(emojis));
  }

  /**
   * Returns a list of all available emojis.
   */
  public async getEmojis(): Promise<Emoji[]> {
    const response: string = await this.get('emojis');
    if (response == null || response.length === 0) {
      return [];
    }

    return <Emoji[]>JSON.parse(response);
  }

  /**
   * Set an announcement text along with a predefined time to live
   * @param text The announcement message
   * @param durationSeconds For how long the announcement message shall be shown
   */
  public async setAnnouncement(text: string, durationSeconds: number): Promise<void> {
    await this.set('announcement', text);
    if (durationSeconds > 0) {
      await this.expire('announcement', durationSeconds);
    }

    return;
  }

  public async getAnnouncement(): Promise<string> {
    return this.get('announcement');
  }

  private onConnected(): void {
    this.logger.info('Successfully connected to redis server');
  }

  private onError(err: Error): void {
    this.logger.error(`Connection error with redis (redis url: ${this.configService.redis.url})`, err);
  }

  private onClosed(): void {
    this.logger.warn('Redis connection has been closed');
  }
}
