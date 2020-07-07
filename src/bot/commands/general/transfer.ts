import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Message, GuildMember } from 'discord.js';
import createPlayer from '../../../utils/create-player';
import { isBound } from '../../../utils/isBound';
import transferEvent from '../../../actions/transfer';

export default class TransferCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'transfer',
      memberName: 'transfer',
      group: 'general',
      description: 'Transfer group ownership to another player',
      guildOnly: true,
      args: [
        {
          key: 'member',
          prompt: 'Who do you want to transfer ownership to?',
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

    await createPlayer({
      name: msg.member.displayName,
      discordId: msg.member.id,
      rank: 'iron1',
    });

    const response = await transferEvent({
      discordId: msg.member.id,
      guildId: msg.guild.id,
      targetId: member.id,
    });

    return msg.channel.send(response.msg);
  }
}
