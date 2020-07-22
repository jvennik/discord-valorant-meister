import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Message, MessageEmbed } from 'discord.js';
import { version } from '../../../../package.json';

export default class InfoCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'info',
      memberName: 'info',
      group: 'general',
      description: 'Information about this bot',
    });
  }

  public async run(msg: CommandoMessage): Promise<Message> {
    const embed = new MessageEmbed({
      author: {
        name: 'Valorant Meister',
      },
      title: 'About this bot',
      description:
        'A bot to help you form valorant groups in your discord server. For bot usage and a list of commands, type `help all` in this DM or `!valorant help` in any channel this bot is in.',
      fields: [
        {
          name: 'Version',
          value: version,
        },
      ],
      timestamp: new Date(),
      color: 16722253,
    });
    return msg.author.send(embed);
  }
}
