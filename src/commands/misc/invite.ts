import { Client, Command } from '@yamdbf/core';
import { Message } from 'discord.js';

// tslint:disable-next-line:no-default-export
export default class extends Command<Client> {
  public constructor() {
    super({
      name: 'invite',
      desc: 'Get an invite url for this bot',
      usage: '<prefix>invite'
    });
  }

  public action(message: Message): void {
    message.channel.send(
      // tslint:disable-next-line:prefer-template
      `You can invite me to your server with this link:\n` +
        `<https://discordapp.com/oauth2/authorize?client_id=${this.client.user.id}&scope=bot&permissions=281600>\n\n` +
        `The default prefix for commands is \`!\`. ` +
        `You can change this with the \`setprefix\` command.\nIf you ever forget the command prefix, ` +
        `just use \`@${this.client.user.tag} prefix\`. ` +
        `Enjoy using ${this.client.user.username} for your Clash Royale server! 👏`
    );
  }
}
