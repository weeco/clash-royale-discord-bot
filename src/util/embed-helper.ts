/**
 * Helper functions to save us writing/updating code everywhere for embeds.
 */
import { Message } from '@yamdbf/core';
import { MessageEmbed } from 'discord.js';
import { PlayerProfile } from 'wrap-royale';

export namespace EmbedHelper {
  /**
   * Sets the MessageEmbed footer.
   */
  export function setCommonFooter(embed: MessageEmbed, info: string): void {
    embed.setFooter(`Community CR Bot - ${info}`, 'https://storage.googleapis.com/clash-royale/stat-bot-pfp.png');
  }

  /**
   * Sets the MessageEmbed author.
   */
  export function setCommonAuthor(embed: MessageEmbed, profile: PlayerProfile): void {
    embed.setAuthor(
      `${profile.name} #${profile.tag}`, // Player Username & #Tag
      profile.arena.getArenaDetails().iconUrls.large, // Arena Icon
      `https://statsroyale.com/profile/${profile.tag}`
    );
  }

  /**
   * Sets the MessageEmbed color.
   */
  export function setCommonColor(embed: MessageEmbed): void {
    embed.setColor(0xe19eff);
  }

  /**
   * Adds announcement to the MessageEmbed. (if there is one)
   */
  export function setCommonAnnouncement(embed: MessageEmbed, announcement: string): void {
    if (announcement != null && announcement.length > 0) {
      embed.addField('Announcement', announcement);
    }
  }

  export function sendWrongHashtagResponse(receivedMessage: Message): Promise<Message | Message[]> {
    return receivedMessage.reply('Invalid hashtag provided.');
  }

  export function sendApiErrorResponse(message: Message, statusCode: number): Promise<Message | Message[]> {
    switch (statusCode) {
      case 400:
        return message.reply('We sent an invalid request to the Supercell API. Try again later!');
      case 404:
        return message.reply('This profile does not exist!');
      case 429:
        return message.reply(
          'Request was rejected because we exceeded the limit of lookups. Try again in a few seconds!'
        );
      case 500:
        return message.reply(
          "An unknown server error occured on Supercell's API server! A Supercell developer has been informed."
        );
      case 503:
        return message.reply("Supercell's api is under maintenace. Please try again later.");
      default:
        return message.reply(`Unknown http response code ${statusCode}`);
    }
  }
}
