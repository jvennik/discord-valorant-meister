import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Message } from 'discord.js';
import leaveEvent from '../../../actions/leave';

export default class LeaveCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'leave',
      memberName: 'leave',
      group: 'general',
      description: 'Leave the group you are currently in',
    });
  }

  public async run(msg: CommandoMessage): Promise<Message> {
    const response = await leaveEvent({
      discordId: msg.member.id,
      guildId: msg.guild.id,
    });

    return msg.channel.send(response.msg);
  }
}
