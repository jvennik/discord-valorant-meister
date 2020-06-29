import { Event } from '../entity/Event';
import { MessageEmbed, EmbedField } from 'discord.js';

export const createEmbed = (events: Event[]): MessageEmbed => {
  const fields: EmbedField[] = [];
  events.forEach((event) => {
    const players = event.players.map((p) => p.name).join(', ');

    fields.push({
      name: `${event.emoji} ${event.name}`,
      value: `${event.players.length}/5 - ${players}`,
      inline: false,
    });
  });

  return new MessageEmbed({
    color: 3447003,
    author: {
      name: 'ValorantMeister',
    },
    title: 'Active events',
    description: 'Click the corresponding group number reaction to join/queue',
    fields: fields,
    timestamp: new Date(),
  });
};
