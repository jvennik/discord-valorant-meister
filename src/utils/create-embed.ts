import { Event } from '../entity/Event';
import { MessageEmbed, EmbedField } from 'discord.js';
import { getPlayerName } from './playerUtils';
import { getNumberEmoji } from './emoji';
import { REMOVAL_EMOJI } from './reactionCollector';

export const createEmbed = (events: Event[]): MessageEmbed => {
  const eventFields: EmbedField[] = [];
  events.forEach((event, index) => {
    // Manually sort the players by last updated date
    const sortedPlayers = event.players.sort(
      (a, b) => a.updatedAt.getTime() - b.updatedAt.getTime()
    );
    const players = sortedPlayers
      .slice(0, 5)
      .map((p) =>
        event.owner.id === p.id
          ? `**${getPlayerName(event.guildId, p.discordId)}**`
          : getPlayerName(event.guildId, p.discordId)
      )
      .join(', ');

    let waitingPlayers;
    if (sortedPlayers.length > 5) {
      waitingPlayers = sortedPlayers
        .slice(5)
        .map((p) => getPlayerName(event.guildId, p.discordId))
        .join(', ');
    }

    const totalPlayers = sortedPlayers.length > 5 ? 5 : sortedPlayers.length;
    const totalWaiting =
      sortedPlayers.length <= 5 ? 0 : sortedPlayers.length - 5;

    eventFields.push({
      name: `${getNumberEmoji(index)} ${event.name}`,
      value: `${totalPlayers}/5 (${totalWaiting} waiting)  - ${players}${
        waitingPlayers ? ` (${waitingPlayers})` : ''
      }`,
      inline: false,
    });
  });

  return new MessageEmbed({
    author: {
      name: 'Valorant Meister',
    },
    title: events.length > 0 ? 'Active events' : 'Currently no active events',
    description:
      events.length > 0
        ? `Click the corresponding group number reaction to join/queue. Click the ${REMOVAL_EMOJI} to leave any event you are currently in.`
        : 'Create an event with `!valorant create <group name>`',
    fields: eventFields,
    timestamp: new Date(),
    color: 16722253,
  });
};
