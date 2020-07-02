import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { unbind, UNBIND_RESULT } from '../../../actions/unbind';
import { Message } from 'discord.js';

export default class UnbindCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'unbind',
      memberName: 'unbind',
      group: 'general',
      description: 'Unbind from any currently bound channel',
      guildOnly: true,
      userPermissions: ['MANAGE_MESSAGES'],
    });
  }

  public async run(msg: CommandoMessage): Promise<Message> {
    try {
      const result = await unbind({ guildId: msg.guild.id });

      switch (result) {
        case UNBIND_RESULT.NOT_BOUND:
          return msg.channel.send(
            'Not currently bound. Please use `!valorant bind` in a channel to bind the bot to it.'
          );
        default:
          return msg.channel.send(
            'Unbound from previous channel! Please run `!valorant bind` again in the channel you would like to use this bot.'
          );
      }
    } catch (e) {
      return msg.channel.send(
        'Something went wrong attempting to unbind the bot!'
      );
    }
  }
}
