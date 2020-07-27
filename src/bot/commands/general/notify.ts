import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { isBound } from '../../../utils/isBound';
import { Message, Role } from 'discord.js';
import { getRepository } from 'typeorm';
import { Guild } from '../../../entity/Guild';

export default class NotifyCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'notify',
      memberName: 'notify',
      group: 'general',
      description:
        'Specify a role to notify when a new event is created in the channel.',
      guildOnly: true,
      userPermissions: ['MANAGE_MESSAGES'],
      args: [
        {
          key: 'role',
          type: 'role',
          prompt:
            'Provide a role (pingable) to notify when new events are created',
        },
      ],
    });
  }

  public async run(
    msg: CommandoMessage,
    { role }: { role: Role }
  ): Promise<Message> {
    const bindResult = await isBound(msg);
    if (!bindResult) {
      return msg.channel.send(
        'This bot is not yet configured. You must first bind the bot to a channel with `!valorant bind`'
      );
    }

    if (!(role instanceof Role) || !role.mentionable) {
      return msg.channel.send('Please provide a valid, pingable role');
    }

    const guildRepository = getRepository(Guild);
    const guild = await guildRepository.findOneOrFail({
      where: { guildId: msg.guild.id },
    });

    guild.boundRoleId = role.id;
    await guildRepository.save(guild);

    return msg.channel.send(
      `Bound the role **${role.name}** to this channel. Certain events will now mention this role!`
    );
  }
}
