import { Emoji } from 'discord.js';
import { RedisService } from '../config/redis.service';
import { AppLogger } from './app-logger';

/**
 * Helper class for Emojis in Discord
 */
export class EmojiHelper {
  private emojiMap: Map<string, Emoji> = new Map();
  private logger: AppLogger = new AppLogger('EmojiHelper');

  public constructor(private redis: RedisService) {}

  public getEmojiString(emojiName: string): string {
    try {
      const emojiObj: Emoji = this.emojiMap.get(emojiName);

      return `<:${emojiObj.name}:${emojiObj.id}>`;
    } catch (err) {
      this.logger.error(`Failed to lookup emoji by emojiName '${emojiName}'`, err);

      return '[N/A]';
    }
  }

  /**
   * Returns the emoji string for the given badge id.
   * @param badgeId Sueprcell's badge id (e. g. 16000000)
   */
  public getBadgeEmoji(badgeId: number): string {
    return this.getEmojiString(badgeId.toString());
  }

  public getCardEmojiByIconName(cardIconName: string): string {
    const cardEmoji: string = this.getEmojiString(cardIconName);
    if (cardEmoji === '[N/A]') {
      return this.getEmojiString('upcomingcard');
    }

    return cardEmoji;
  }

  public getChestEmojiByName(chestName: string): string {
    const chestEmojiName: string = chestName
      .toLowerCase()
      .replace(/\s/g, '') // Remove all whitespaces
      .replace('goldenchest', 'goldchest');

    return this.getEmojiString(chestEmojiName);
  }

  public async init(): Promise<void> {
    const emojis: Emoji[] = await this.redis.getEmojis();
    emojis.map((x: Emoji) => this.emojiMap.set(x.name, x));
  }
}
