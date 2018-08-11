import { Command, Message } from '@yamdbf/core';
import { CRApi, HashtagHelper } from 'wrap-royale';
import { ClashRoyaleClient } from '../../client/clash-royale-client';
import { AppLogger } from '../../util/app-logger';

// tslint:disable-next-line:no-default-export
export default class extends Command<ClashRoyaleClient> {
  private logger: AppLogger = new AppLogger('SaveCommand');

  public constructor() {
    super({
      name: 'save',
      aliases: ['store', 'link'],
      desc: 'Saves a Clash Royale player hashtag for your discord account.',
      usage: '<prefix>save #VR80OUJG',
      group: 'ClashRoyale'
    });
  }

  public async action(message: Message, [hashtagArg]: string[]): Promise<Message | Message[]> {
    message.channel.startTyping();
    const hashtag: string = HashtagHelper.normalizeHashtag(hashtagArg);

    // Validate hashtag
    if (!HashtagHelper.isValidHashtag(hashtag)) {
      message.channel.stopTyping();

      return message.reply('Invalid hashtag provided.');
    }

    // Check if the API can find a profile with the provided hashtag
    try {
      await this.client.crApi.playerProfile(hashtag);
    } catch (err) {
      if (err.response != null) {
        switch (err.response.status) {
          case 404:
            message.reply('A profile with this hashtag does not exist. Please recheck the provided tag.');
            message.channel.stopTyping();

            return;
          default:
        }
      }
    }

    // Link hashtag to the discord user
    this.client.userSettings.set(`${message.author.id}.hashtag`, hashtag);
    message.reply(`your profile #${hashtag} has been linked to your discord account.`);
    message.channel.stopTyping();

    return;
  }
}
