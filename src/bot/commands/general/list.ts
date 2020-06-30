import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { TextChannel } from 'discord.js';
import { getEventsDetails } from '../../../actions/report';

export default class ListCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'list',
      group: 'general',
      memberName: 'list',
      description: 'Lists available groups',
      guildOnly: true,
    });
  }

  public async run(msg: CommandoMessage): Promise<null> {
    if (msg.channel instanceof TextChannel) {
      await getEventsDetails({ guildId: msg.guild.id, channel: msg.channel });
    }

    return null;
  }
}
