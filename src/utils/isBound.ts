import { CommandoMessage } from 'discord.js-commando';
import createGuild from './create-guild';

/**
 * Checks if the guild the message was sent in has a bound channel
 * @param msg Commando Message
 */
export const isBound = async (msg: CommandoMessage): Promise<boolean> => {
  const guild = await createGuild({ guildId: msg.guild.id });

  if (!guild.boundChannelId || guild.boundChannelId !== msg.channel.id) {
    return false;
  }

  return true;
};
