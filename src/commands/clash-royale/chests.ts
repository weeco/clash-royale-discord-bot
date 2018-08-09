import { Command, Message } from '@yamdbf/core';
import commaNumber from 'comma-number';
import { MessageEmbed } from 'discord.js';
import prettyHrtime from 'pretty-hrtime';
import { CardHelper, ICardDetails, ILeagueStatistics, PlayerProfile, UpcomingChest, UpcomingChests } from 'wrap-royale';
import { ClashRoyaleClient } from '../../client/clash-royale-client';
import { AppLogger } from '../../util/app-logger';
import { EmbedHelper } from '../../util/embed-helper';
import { ParseHelper } from '../../util/parse-helper';

//tslint:disable:max-line-length
const chestThumbnails: ChestThumbnails = {
  'Wooden Chest':
    'https://vignette.wikia.nocookie.net/clashroyale/images/3/30/WoodenChest.png/revision/latest/scale-to-width-down/160?cb=20160209231106',
  'Silver Chest':
    'https://vignette.wikia.nocookie.net/clashroyale/images/0/07/SilverChest.png/revision/latest/scale-to-width-down/160?cb=20160209231106',
  'Golden Chest':
    'https://vignette.wikia.nocookie.net/clashroyale/images/8/8b/GoldenChest.png/revision/latest/scale-to-width-down/160?cb=20160209231105',
  'Giant Chest':
    'https://vignette.wikia.nocookie.net/clashroyale/images/d/da/Giant_chest.png/revision/latest/scale-to-width-down/120?cb=20160306083332',
  'Magical Chest':
    'https://vignette.wikia.nocookie.net/clashroyale/images/9/93/MagicalChest.png/revision/latest/scale-to-width-down/160?cb=20160312171354',
  'Epic Chest':
    'https://vignette.wikia.nocookie.net/clashroyale/images/f/f5/EpicChest.png/revision/latest/scale-to-width-down/120?cb=20160923080038',
  'Super Magical Chest':
    'https://vignette.wikia.nocookie.net/clashroyale/images/6/65/SuperMagicalChest.png/revision/latest/scale-to-width-down/120?cb=20161224214132',
  'Legendary Chest':
    'https://vignette.wikia.nocookie.net/clashroyale/images/a/a1/LegendChest.png/revision/latest/scale-to-width-down/120?cb=20161002204147'
};
//tslint:enable:max-line-length

// tslint:disable-next-line:no-default-export
export default class extends Command<ClashRoyaleClient> {
  private logger: AppLogger = new AppLogger('ClashRoyaleChestsCommand');

  public constructor() {
    super({
      name: 'chests',
      desc: 'Requests upcoming chest info for a Clash Royale player..',
      usage: '<prefix>chests #VR80OUJG',
      group: 'ClashRoyale'
    });
  }

  public async action(message: Message, [hashtagArg]: string[]): Promise<Message | Message[]> {
    const startWatch: [number, number] = process.hrtime();
    let hashtag: string;
    try {
      hashtag = await ParseHelper.tryParseHashtag(message, hashtagArg, this.client.userSettings);
    } catch (err) {
      message.reply(err.message);
    }

    try {
      const p1: Promise<PlayerProfile> = this.client.crApi.playerProfile(hashtag);
      const p2: Promise<UpcomingChests> = this.client.crApi.playersUpcomingChests(hashtag);
      const [profile, chests] = await Promise.all([p1, p2]);
      const stopWatch: [number, number] = process.hrtime(startWatch);
      const elapsed: string = prettyHrtime(stopWatch);
      const embed: MessageEmbed = this.createChestEmbed(profile, chests, elapsed);

      return message.reply('Here you go!', { embed });
    } catch (err) {
      // Handle API errors
      if (err.response != null && err.response.status !== 200) {
        return EmbedHelper.sendApiErrorResponse(message, err.response.status);
      }
      this.logger.error(`Unknown error while requesting profile ${hashtag}`, err.stack);

      return message.reply('Something went wrong while fetching your profile. Developers have been informed.');
    } finally {
      message.channel.stopTyping();
    }
  }

  /**
   * Returns an MessageEmbed for a players upcoming chests.
   */
  private createChestEmbed(profile: PlayerProfile, chests: UpcomingChests, elapsed: string): MessageEmbed {
    const embed: MessageEmbed = new MessageEmbed();
    EmbedHelper.setCommonAuthor(embed, profile);
    EmbedHelper.setCommonColor(embed);
    EmbedHelper.setCommonFooter(embed, elapsed);
    embed.setThumbnail(chestThumbnails[chests.items[0].name]);
    // Upcoming chest + Special Chests
    this.addUpcomingChestsFields(embed, chests);

    return embed;
  }

  /**
   * Adds fields to the MessageEmbed for a player's upcoming chests.
   */
  private addUpcomingChestsFields(embed: MessageEmbed, chests: UpcomingChests): void {
    // Chests
    let upcomingChestsContent: string = '|';
    let upcomingSpecialChestsContent: string = '';
    chests.items.forEach((chest: UpcomingChest, index: number) => {
      const chestEmoji: string = this.client.emojiHelper.getChestEmojiByName(chest.name);

      if (index < 9) {
        if (index === 1) {
          upcomingChestsContent += '|';
        }
        // Only add 7 chests so that we can show upcoming + special chests in one line
        upcomingChestsContent += `${chestEmoji}`;
      } else {
        upcomingSpecialChestsContent += `${chestEmoji}${chest.index + 1}`;
      }
    });
    // embed.addBlankField(true);
    embed.addField('Upcoming Chests', upcomingChestsContent);
    embed.addField('Special Chests', upcomingSpecialChestsContent);
  }
}

type ChestThumbnails = {
  'Wooden Chest': string;
  'Silver Chest': string;
  'Golden Chest': string;
  'Giant Chest': string;
  'Magical Chest': string;
  'Epic Chest': string;
  'Super Magical Chest': string;
  'Legendary Chest': string;
};
