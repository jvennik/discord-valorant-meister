import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Message, TextChannel } from 'discord.js';
import leaveEvent, { LEAVE_RESULT } from '../../../actions/leave';
import { getEventsDetails } from '../../../actions/eventDetails';

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

    if (
      response.result === LEAVE_RESULT.LEFT_EVENT ||
      response.result === LEAVE_RESULT.EVENT_REMOVED ||
      response.result === LEAVE_RESULT.TRANSFERRED
    ) {
      if (msg.channel instanceof TextChannel) {
        await getEventsDetails({ guildId: msg.guild.id, channel: msg.channel });
      }
    }

    return msg.channel.send(response.msg);
  }
}
