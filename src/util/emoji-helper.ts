import { Emoji } from 'discord.js';
import { EmojiStorage } from '../storages/emoji-storage';
import { AppLogger } from './app-logger';

/**
 * Helper class for Emojis in Discord
 */
export class EmojiHelper {
  private logger: AppLogger = new AppLogger('EmojiHelper');

  public constructor(private emojiStorage: EmojiStorage) {}

  public getEmojiString(emojiName: string): string {
    try {
      const emojiObj: Emoji = this.emojiStorage.emojiMap.get(emojiName);

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
}
