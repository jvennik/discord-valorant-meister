import { Event } from '../entity/Event';
import { Guild } from '../entity/Guild';
import { TextChannel } from 'discord.js';
import config from '../config';
import { getEventsDetails } from './eventDetails';
import { getRepository } from 'typeorm';
import logger from '../logger';

export const periodicMessage = async ({
  guildId,
  channel,
  botId,
}: {
  guildId: string;
  channel: TextChannel;
  botId: string;
}): Promise<void> => {
  const guildRepository = getRepository(Guild);
  const guild = await guildRepository.findOne({
    where: { guildId },
  });

  if (!guild) {
    logger.error('Cannot perform periodicMessage, guild does not exist');
    return;
  }

  if (guild.boundChannelId !== channel.id) {
    return;
  }

  const eventRepository = getRepository(Event);
  const events = await eventRepository.find({
    where: { guildId },
  });

  if (events.length === 0) {
    return;
  }

  const latestMessages = await channel.messages.fetch({
    limit: Number(config.events.messageLimit),
  });

  const recentBotMessage = latestMessages.find(
    (msg) => msg.author.id === botId
  );
  const shouldSend = recentBotMessage ? false : true;

  if (shouldSend) {
    await getEventsDetails({
      guildId: guildId,
      channel: channel,
    });
  }
};

export default periodicMessage;
