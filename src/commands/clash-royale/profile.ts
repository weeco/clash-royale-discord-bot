import { Command, Message } from '@yamdbf/core';
import commaNumber from 'comma-number';
import { MessageEmbed } from 'discord.js';
import prettyHrtime from 'pretty-hrtime';
import { CardHelper, ICardDetails, ILeagueStatistics, PlayerProfile, UpcomingChest, UpcomingChests } from 'wrap-royale';
import { ClashRoyaleClient } from '../../client/clash-royale-client';
import { AppLogger } from '../../util/app-logger';
import { EmbedHelper } from '../../util/embed-helper';
import { ParseHelper } from '../../util/parse-helper';

// tslint:disable-next-line:no-default-export
export default class extends Command<ClashRoyaleClient> {
  private logger: AppLogger = new AppLogger('ClashRoyaleProfileCommand');

  public constructor() {
    super({
      name: 'profile',
      desc: 'Requests profile info for a Clash Royale player.',
      usage: '<prefix>profile #VR80OUJG',
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
      const embed: MessageEmbed = this.sketchyProfileEmbeds(profile, chests, elapsed);

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
   * Returns an embedarray for player profiles.
   * @param profile The fetched player profile
   * @param chests The fetched player's chests
   * @param elapsed Elapsed time string for the API requests
   */
  private sketchyProfileEmbeds(profile: PlayerProfile, chests: UpcomingChests, elapsed: string): MessageEmbed {
    const embed: MessageEmbed = new MessageEmbed();
    let favoriteCardDetails: ICardDetails;
    if (profile.currentFavouriteCard == null) {
      favoriteCardDetails = CardHelper.getCardById(26000000);
    } else {
      favoriteCardDetails = profile.currentFavouriteCard.getCardDetails();
    }
    EmbedHelper.setCommonAuthor(embed, profile);
    EmbedHelper.setCommonColor(embed);
    EmbedHelper.setCommonFooter(embed, elapsed);

    // Current and best trophies
    const trophyEmoji: string = this.client.emojiHelper.getEmojiString('trophies');
    embed.addField(
      'Trophies',
      `${commaNumber(profile.trophies)}/${commaNumber(profile.bestTrophies)} PB ${trophyEmoji}`,
      true
    );

    // Explevel
    const expLevelEmoji: string = this.client.emojiHelper.getEmojiString('playerlevel');
    embed.addField('Level', `${profile.expLevel} ${expLevelEmoji}`, true);

    // Clan
    if (profile.clan != null) {
      const clanBadgeEmoji: string = this.client.emojiHelper.getBadgeEmoji(profile.clan.badgeId);
      embed.addField(
        'Clan',
        `[${clanBadgeEmoji} ${profile.clan.name}](https://statsroyale.com/en/clan/${profile.clan.tag})`,
        true
      );
      embed.addField('Role', `${this.capitalizeFirstLetter(profile.role)}`, true);
    }

    // Cards found
    const cardsEmoji: string = this.client.emojiHelper.getEmojiString('cards');
    embed.addField('Cards Found', `${commaNumber(profile.cards.length)} ${cardsEmoji}`, true);

    // Current favorite card
    if (profile.currentFavouriteCard != null) {
      const favoriteCardEmoji: string = this.client.emojiHelper.getCardEmojiByIconName(favoriteCardDetails.cardKey);
      embed.addField('Favorite Card', `${favoriteCardDetails.name.en} ${favoriteCardEmoji}`, true);
    }

    // Wins / Losses / Draws
    const draws: string = commaNumber(profile.battleCount - (profile.wins + profile.losses));
    const battleEmoji: string = this.client.emojiHelper.getEmojiString('battleladder');
    const winLossDraw: string = `${commaNumber(profile.wins)} / ${commaNumber(
      profile.losses
    )} / ${draws} ${battleEmoji}`;
    embed.addField('Wins / Losses / Draws', winLossDraw, true);

    // Three Crown Wins
    const threeCrownEmoji: string = this.client.emojiHelper.getEmojiString('threecrown');
    embed.addField('Three Crown Wins', `${commaNumber(profile.threeCrownWins)} ${threeCrownEmoji}`, true);

    // Tournament wins
    embed.addField('Tournament Cards Won', `${commaNumber(profile.tournamentCardsWon)} ${cardsEmoji}`, true);
    // Challenge Cards
    embed.addField('Challenge Cards Won', `${commaNumber(profile.challengeCardsWon)} ${cardsEmoji}`, true);
    // Max challenge wins
    embed.addField('Challenge Max Wins', profile.challengeMaxWins, true);
    // Total Donations
    embed.addField('Total Donations', `${commaNumber(profile.totalDonations)} ${cardsEmoji}`, true);

    // If this player competes in seasons
    if (profile.leagueStatistics != null) {
      const league: ILeagueStatistics = profile.leagueStatistics;
      // Previous season
      if (league.previousSeason != null) {
        const rank: string =
          !league.previousSeason.rank || league.previousSeason.rank === 0
            ? 'Unranked'
            : `#${league.previousSeason.rank}`;
        embed.addField('Previous Season', `${league.previousSeason.trophies} ${trophyEmoji} (${rank})`, true);
      }
      // Best season
      if (league.bestSeason != null) {
        //tslint:disable-next-line:max-line-length
        const rank: string =
          !league.bestSeason.rank || league.bestSeason.rank === 0 ? 'Unranked' : `#${league.bestSeason.rank}`;
        embed.addField('Best Season', `${league.bestSeason.trophies} ${trophyEmoji} (${rank})`, true);
      }
    }

    // Battle deck
    this.addBattleDeckField(embed, profile);
    // Upcoming chest + Special Chests
    this.addUpcomingChestsFields(embed, chests);

    return embed;
  }

  private capitalizeFirstLetter(inputString: string): string {
    return inputString.charAt(0).toUpperCase() + inputString.slice(1);
  }

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
        if (index < 7) {
          upcomingChestsContent += `${chestEmoji}`;
        }
      } else {
        upcomingSpecialChestsContent += `${chestEmoji}${chest.index + 1}`;
      }
    });
    // embed.addBlankField(true);
    embed.addField('Upcoming Chests', upcomingChestsContent, true);
    embed.addField('Special Chests', upcomingSpecialChestsContent, true);
  }

  private addBattleDeckField(embed: MessageEmbed, profile: PlayerProfile): void {
    // Some old / inactive profiles don't have a battle deck at all
    if (profile.currentDeck.length === 0) {
      return;
    }

    let battleDeckContent: string = '';
    const battleDeckCardLinks: number[] = [];
    for (const card of profile.currentDeck) {
      const cardDetails: ICardDetails = card.getCardDetails();
      // Add card decklinks to array
      battleDeckCardLinks.push(CardHelper.getCardByName(cardDetails.name.en).id);

      const cardEmoji: string = this.client.emojiHelper.getCardEmojiByIconName(cardDetails.cardKey);
      battleDeckContent += `${cardEmoji}${card.level}`;
    }

    // Export deck
    /*const copyDeckEmoji: string = EmojiHelper.getEmojiString('exportdeck');
    const copyDeckBaseUrl: string = 'https://link.clashroyale.com/deck/en?deck=';
    const copyDeckUrl: string = `${copyDeckBaseUrl}${battleDeckCardLinks.join(';')}`;
    const copyDeckLine: string = `[${copyDeckEmoji} Copy deck](${copyDeckUrl})`;*/

    embed.addField('Current Deck', `${battleDeckContent}`);
  }
}
