import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Message } from 'discord.js';
import createPlayer from '../../../utils/create-player';
import { isBound } from '../../../utils/isBound';
import disbandEvent from '../../../actions/disband';

export default class DisbandCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'disband',
      memberName: 'disband',
      group: 'general',
      description: 'Disband your group (owner only)',
      guildOnly: true,
    });
  }

  public async run(msg: CommandoMessage): Promise<Message> {
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

    const response = await disbandEvent({
      discordId: msg.member.id,
      guildId: msg.guild.id,
    });

    return msg.channel.send(response.msg);
  }
}
