import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Message } from 'discord.js';
import { bindToChannel, BIND_RESULT } from '../../../actions/bind';

export default class BindCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'bind',
      memberName: 'bind',
      group: 'general',
      guildOnly: true,
      userPermissions: ['MANAGE_MESSAGES'],
      description:
        'Bind the bot to the channel this command is ran in. This will also be the channel the monitor runs in',
    });
  }

  public async run(msg: CommandoMessage): Promise<Message> {
    try {
      const result = await bindToChannel({
        guildId: msg.guild.id,
        channelId: msg.channel.id,
      });

      switch (result) {
        case BIND_RESULT.ALREADY_BOUND:
          return msg.channel.send('This channel is already bound!');
        default:
          return msg.channel.send(
            'Now bound to this channel. The monitor and commands will only work here.'
          );
      }
    } catch (e) {
      return msg.channel.send(
        'Something went wrong with the bind command. Sorry!'
      );
    }
  }
}
