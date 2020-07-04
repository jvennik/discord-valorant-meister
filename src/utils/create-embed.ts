import { Event } from '../entity/Event';
import { MessageEmbed, EmbedField } from 'discord.js';

export const createEmbed = (events: Event[]): MessageEmbed => {
  const fields: EmbedField[] = [];
  events.forEach((event) => {
    const players = event.players
      .slice(0, 5)
      .map((p) => p.name)
      .join(', ');

    let waitingPlayers;
    if (event.players.length > 5) {
      waitingPlayers = event.players
        .slice(5)
        .map((p) => p.name)
        .join(', ');
    }

    const totalPlayers = event.players.length > 5 ? 5 : event.players.length;
    const totalWaiting =
      event.players.length <= 5 ? 0 : event.players.length - 5;

    fields.push({
      name: `${event.emoji} ${event.name}`,
      value: `${totalPlayers}/5 (${totalWaiting} waiting)  - ${players}${
        waitingPlayers ? ` (${waitingPlayers})` : ''
      }`,
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
