import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { GuildMember, Message, TextChannel } from 'discord.js';
import { getRepository } from 'typeorm';
import { Player } from '../../../entity/Player';
import { Event } from '../../../entity/Event';
import { getEventsDetails } from '../../../actions/eventDetails';

export default class KickCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'kick',
      memberName: 'kick',
      group: 'general',
      guildOnly: true,
      description:
        'Kick a member out of the current event. Only the event owner can use this command.',
      args: [
        {
          key: 'member',
          prompt: 'Provide the member of the event you wish to kick',
          type: 'member',
        },
      ],
    });
  }

  public async run(
    msg: CommandoMessage,
    { member }: { member: GuildMember }
  ): Promise<Message> {
    const playerRepository = getRepository(Player);
    const eventRepository = getRepository(Event);
    const player = await playerRepository.findOne({
      where: { discordId: msg.author.id },
      relations: ['joinedEvent', 'joinedEvent.owner', 'joinedEvent.players'],
    });

    if (
      !player ||
      !player.joinedEvent ||
      player.joinedEvent.owner.id !== player.id
    ) {
      return msg.channel.send('You are not in an event or are not the owner.');
    }

    if (player.discordId === member.id) {
      return msg.channel.send(
        "You can't kick yourself. Transfer ownership of the event first with `!valorant transfer @user`"
      );
    }

    if (!player.joinedEvent.players.some((p) => p.discordId === member.id)) {
      return msg.channel.send('The target player is not in your event');
    }

    player.joinedEvent.players = player.joinedEvent.players.filter(
      (p) => p.discordId !== member.id
    );
    await eventRepository.save(player.joinedEvent);

    if (msg.channel instanceof TextChannel) {
      await getEventsDetails({ guildId: msg.guild.id, channel: msg.channel });
    }

    return msg.channel.send(
      `**${member.displayName}** removed from event **${player.joinedEvent.name}**`
    );
  }
}
