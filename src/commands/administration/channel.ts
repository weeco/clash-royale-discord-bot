import { Command, GuildSettings, Message } from '@yamdbf/core';
import { Collection, TextChannel } from 'discord.js';
import { ClashRoyaleClient } from '../../client/clash-royale-client';
import { AppLogger } from '../../util/app-logger';

// tslint:disable-next-line:no-default-export
export default class extends Command<ClashRoyaleClient> {
  private logger: AppLogger = new AppLogger('ChannelCommand');

  public constructor() {
    super({
      name: 'channel',
      aliases: ['channels'],
      desc:
        'Mention the channel(s) you want to restrict commands to.' +
        "If you don't mention any channels, the channel restrictions will be reset.",
      usage: '<prefix>channel #channel-a #channel-b',
      group: 'Administration',
      guildOnly: true
    });
  }

  public async action(message: Message): Promise<Message | Message[]> {
    const channels: Collection<string, TextChannel> = message.mentions.channels;
    const hasChannelsMentioned: boolean = channels != null && channels.size > 0 ? true : false;
    const guildSettings: GuildSettings = this.client.storage.guilds.get(message.guild.id).settings;
    if (!hasChannelsMentioned) {
      guildSettings.remove('channels');
      this.client.storage.guilds.delete('channels');

      return message.reply('Channel restrictions have been reset in this server.');
    }

    const channelIds: string[] = channels.map((x: TextChannel) => x.id);
    guildSettings.set('channels', channelIds);

    return message.reply(`Bot usage has been restricted to the provided channels.`);
  }
}
