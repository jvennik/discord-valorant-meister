import { CommandoClient, Command, CommandoMessage } from 'discord.js-commando';
import { Message, TextChannel } from 'discord.js';
import { getRepository } from 'typeorm';
import { Event } from '../../../entity/Event';
import { getEventsDetails } from '../../../actions/eventDetails';

export default class DestroyCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'destroy',
      memberName: 'destroy',
      group: 'admin',
      guildOnly: true,
      userPermissions: ['MANAGE_MESSAGES'],
      description: 'Forcefully delete a group',
      args: [
        {
          key: 'groupName',
          type: 'string',
          prompt: 'Enter a group name to delete',
        },
      ],
    });
  }

  public async run(
    msg: CommandoMessage,
    { groupName }: { groupName: string }
  ): Promise<Message> {
    const eventRepository = getRepository(Event);

    const event = await eventRepository.findOne({
      where: { name: groupName, guildId: msg.guild.id },
    });

    if (!event) {
      return msg.channel.send('Unknown event');
    }

    await eventRepository.delete(event);

    if (msg.channel instanceof TextChannel) {
      await getEventsDetails({ guildId: msg.guild.id, channel: msg.channel });
    }

    return msg.channel.send(`Deleted event: **${event.name}**`);
  }
}
