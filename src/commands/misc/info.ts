import { Client, Command } from '@yamdbf/core';
import { Message } from 'discord.js';

// tslint:disable-next-line:no-default-export
export default class extends Command<Client> {
  public constructor() {
    super({
      name: 'info',
      desc: 'Get more information about the bot',
      usage: '<prefix>invite',
      guildOnly: false,
      group: 'misc'
    });
    this.disable();
  }

  public action(message: Message): void {}
}
