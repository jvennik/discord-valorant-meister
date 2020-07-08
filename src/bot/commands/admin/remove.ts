import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { GuildMember, Message, TextChannel } from 'discord.js';
import leaveEvent, { LEAVE_RESULT } from '../../../actions/leave';
import { getEventsDetails } from '../../../actions/eventDetails';

export default class RemoveCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'remove',
      memberName: 'remove',
      group: 'admin',
      guildOnly: true,
      description:
        'Remove a user from any event. Same as forcing them to leave the event. If they are the last user, the event will be disbanded.',
      userPermissions: ['MANAGE_MESSAGES'],
      args: [
        {
          key: 'member',
          prompt: 'Provide the user you wish to remove',
          type: 'member',
        },
      ],
    });
  }

  public async run(
    msg: CommandoMessage,
    { member }: { member: GuildMember }
  ): Promise<Message> {
    const response = await leaveEvent({
      discordId: member.id,
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
