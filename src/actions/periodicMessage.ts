import { Event } from '../entity/Event';
import { Guild } from '../entity/Guild';
import { TextChannel } from 'discord.js';
import config from '../config';
import { getEventsDetails } from './report';
import { getRepository } from 'typeorm';
import logger from '../logger';

export const periodicMessage = async ({
  guildId,
  channel,
}: {
  guildId: string;
  channel: TextChannel;
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
    (msg) => msg.author.username === config.general.botUsername
  );

  let shouldSend = true;
  if (recentBotMessage) {
    const msgTimestamp: Date = new Date(recentBotMessage.createdTimestamp);
    const now = new Date();

    const difference = now.getTime() - msgTimestamp.getTime();
    const minutes = Math.floor(difference / 1000 / 60);

    if (minutes < Number(config.events.minutesBetweenReports)) {
      shouldSend = false;
    }
  }

  if (shouldSend) {
    if (guild.boundMessageId) {
      const existingMessage = await channel.messages.fetch(
        guild.boundMessageId
      );

      if (existingMessage) {
        await existingMessage.delete();
      }
    }

    const msg = await getEventsDetails({
      guildId: guildId,
      channel: channel,
    });
    if (msg) {
      guild.boundMessageId = msg.id;
      guildRepository.save(guild);
    }
  }
};

export default periodicMessage;
