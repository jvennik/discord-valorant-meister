import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import createPlayer from '../../../utils/create-player';
import createEvent, { EVENT_RESULT } from '../../../actions/create';
import { Message } from 'discord.js';

export default class CreateCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'create',
      memberName: 'create',
      group: 'general',
      description: 'Create a group',
      args: [
        {
          key: 'eventName',
          prompt: 'What will the group be named?',
          type: 'string',
        },
      ],
    });
  }

  public async run(
    msg: CommandoMessage,
    { eventName }: { eventName: string }
  ): Promise<Message> {
    await createPlayer({
      name: msg.member.displayName,
      discordId: msg.member.id,
      rank: 'iron1',
    });

    const response = await createEvent({
      guildId: msg.guild.id,
      name: eventName,
      owner: msg.member.id,
    });
    if (response === EVENT_RESULT.CREATED) {
      return msg.channel.send(`Created event: ${eventName}`);
    } else if (response === EVENT_RESULT.ALREADY_OWNED) {
      return msg.channel.send(
        `${msg.member.displayName}, you already own an event`
      );
    } else if (response === EVENT_RESULT.MAX) {
      return msg.channel.send(
        `${msg.member.displayName}, sorry max number of events reached`
      );
    }

    return msg.channel.send('Something went wrong creating the group');
  }
}
