import { TextChannel, Message } from 'discord.js';
import { getRepository } from 'typeorm';
import { Event } from '../entity/Event';
import { createEmbed } from '../utils/create-embed';
import logger from '../logger';
import { Guild } from '../entity/Guild';
import { addReactionCollector } from '../utils/reactionCollector';

export const getEventsDetails = async ({
  guildId,
  channel,
}: {
  guildId: string;
  channel: TextChannel;
}): Promise<Message | undefined> => {
  const eventRepository = getRepository(Event);
  const guildRepository = getRepository(Guild);
  const guild = await guildRepository.findOne({ guildId });
  const events = await eventRepository.find({
    where: { guildId },
    relations: ['players', 'owner'],
  });

  const embed = createEmbed(events);

  if (!guild) {
    throw new Error('Guild not found when trying to fetch event details');
  }

  if (guild.boundMessageId) {
    try {
      const existingMessage = await channel.messages.fetch(
        guild.boundMessageId
      );

      await existingMessage.delete();
    } catch (e) {
      logger.error('Exiting message didnt exist. Skipping deletion.');
    }
  }

  try {
    const posted = await channel.send(embed);
    guild.boundMessageId = posted.id;
    await guildRepository.save(guild);

    await addReactionCollector(posted, events);
    return posted;
  } catch (e) {
    logger.error('Something went wrong posting message', e);
  }
  return;
};
