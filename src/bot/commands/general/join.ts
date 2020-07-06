import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import createPlayer from '../../../utils/create-player';
import joinEvent, { JOIN_RESULT } from '../../../actions/join';
import { Message } from 'discord.js';
import { isBound } from '../../../utils/isBound';
import { getRepository } from 'typeorm';
import { Event } from '../../../entity/Event';

export default class JoinCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'join',
      memberName: 'join',
      group: 'general',
      description: 'Join an existing group',
      args: [
        {
          key: 'name',
          prompt: 'Please type the name of the event you wish to join',
          type: 'string',
        },
      ],
    });
  }

  public async run(
    msg: CommandoMessage,
    { name }: { name: string }
  ): Promise<Message> {
    const bindResult = await isBound(msg);
    if (!bindResult) {
      return msg.channel.send(
        'This bot is not yet configured. You must first bind the bot to a channel with `!valorant bind`'
      );
    }
    await createPlayer({
      name: msg.member.displayName,
      discordId: msg.member.id,
      rank: 'iron1',
    });

    const eventRepository = getRepository(Event);

    const event = await eventRepository.findOne({
      where: { name },
      relations: ['players'],
    });

    if (!event) {
      return msg.channel.send('Event not found!');
    }

    const didJoin = await joinEvent({
      guildId: msg.guild.id,
      discordId: msg.member.id,
      event,
    });

    if (didJoin === JOIN_RESULT.JOINED) {
      return msg.channel.send(`${msg.member.displayName} joined a group`);
    } else if (didJoin === JOIN_RESULT.ALREADY_JOINED) {
      return msg.channel.send(
        `${msg.member.displayName} you're already in the event doofus`
      );
    } else if (didJoin === JOIN_RESULT.OTHER_EVENT) {
      return msg.channel.send(
        `${msg.member.displayName}, leave your other event first before joining another`
      );
    } else {
      return msg.channel.send(
        `${msg.member.displayName} your rank is not compatible with the chosen event`
      );
    }
  }
}
