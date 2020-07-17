import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Message, GuildMember, TextChannel } from 'discord.js';
import createPlayer from '../../../utils/create-player';
import { isBound } from '../../../utils/isBound';
import { bumpMember } from '../../../actions/bump';
import { getEventsDetails } from '../../../actions/eventDetails';

export default class BumpCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'bump',
      memberName: 'bump',
      group: 'general',
      description:
        'Bump an event member to the end of the group and move the rest of the members forward',
      guildOnly: true,
      args: [
        {
          key: 'member',
          prompt: 'Please provide the member you wish to bump',
          type: 'member',
        },
      ],
    });
  }

  public async run(
    msg: CommandoMessage,
    { member }: { member: GuildMember }
  ): Promise<Message> {
    const bindResult = await isBound(msg);
    if (!bindResult) {
      return msg.channel.send(
        'This bot is not yet configured. You must first bind the bot to a channel with `!valorant bind`'
      );
    }
    const player = await createPlayer({
      name: msg.member.displayName,
      discordId: msg.member.id,
      rank: 'iron1',
      relations: ['joinedEvent', 'joinedEvent.players', 'joinedEvent.owner'],
    });

    // If the player is not in an event or the player is not the owner of the event
    // or the player does not have the MANAGE_MESSAGES permission, refuse this request
    if (
      (!player.joinedEvent ||
        player.joinedEvent.owner.discordId !== msg.author.id) &&
      !msg.member.hasPermission(['MANAGE_MESSAGES'])
    ) {
      return msg.author.send(
        'You do not have permission to run this command. You must either be the owner an event or have the the permission to manage messages on the server'
      );
    }

    // We need to check once more if the user has the MANAGE_MESSAGES permission here
    // because we need to ignore checking the players joinedEvent since that user
    // may not actually be in any event in the first place.
    // However, if its not an admin, they should never reach this point if they arent already in
    // a group anyways since the check above would error out
    if (
      !msg.member.hasPermission(['MANAGE_MESSAGES']) &&
      !player.joinedEvent.players.some((p) => p.discordId === member.id)
    ) {
      return msg.channel.send('That member is not any event.');
    }

    await bumpMember({ memberId: member.id });

    if (msg.channel instanceof TextChannel) {
      await getEventsDetails({ guildId: msg.guild.id, channel: msg.channel });
    }

    return msg.channel.send(`**${member.displayName}** was bumped.`);
  }
}
