import { EmbedField, TextChannel } from 'discord.js';
import { getRepository } from 'typeorm';
import { Event } from '../entity/Event';

export const getEventsDetails = async function getEventsDetails({
  guildId,
  channel,
}: {
  guildId: string;
  channel: TextChannel;
}): Promise<void> {
  const eventRepository = getRepository(Event);
  const events = await eventRepository.find({
    where: { guildId },
    relations: ['players'],
  });

  const fields: EmbedField[] = [];
  events.forEach((event) => {
    const players = event.players.map((p) => p.name).join(', ');

    fields.push({
      name: `${event.emoji} ${event.name}`,
      value: `${event.players.length}/5 - ${players}`,
      inline: false,
    });
  });

  const msg = {
    embed: {
      color: 3447003,
      author: {
        name: 'ValorantMeister',
      },
      title: 'Active events',
      description:
        'Click the corresponding group number reaction to join/queue',
      fields: fields,
      timestamp: new Date(),
    },
  };

  const posted = await channel.send(msg).catch((err) => {
    console.error(err);
    console.error('Failed to post message');
  });

  if (posted) {
    events.forEach((event) => {
      posted.react(event.emoji);
    });
  }
};
