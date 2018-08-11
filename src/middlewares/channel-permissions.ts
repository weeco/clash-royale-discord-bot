import { GuildSettings, Message } from '@yamdbf/core';
import { ClashRoyaleClient } from '../client/clash-royale-client';

// tslint:disable:no-any
export async function checkChannelPermissions(
  message: Message,
  args: any[],
  client: ClashRoyaleClient
): Promise<[Message, any[]]> {
  // tslint:enable:no-any
  // No channel permissions for DMs
  // const guildPrefix: string = await client.getPrefix(message.guild); <- If stricter channel command check is necessary
  if (!message.guild || message.content.includes(`channel`)) {
    return [message, args];
  }

  const guildSettings: GuildSettings = await client.storage.guilds.get(message.guild.id).settings;
  const allowedChannels: string[] = guildSettings != null ? await guildSettings.get('channels') : [];
  if (allowedChannels == null || allowedChannels.length === 0) {
    return [message, args];
  } else if (allowedChannels.includes(message.channel.id)) {
    return [message, args];
  }
}
