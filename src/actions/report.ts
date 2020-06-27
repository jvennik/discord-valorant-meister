import { dball } from '../utils/dball';
import { EmbedField, TextChannel } from 'discord.js';
import Event from '../models/Event';

const getEventsDetailsSql = `
  SELECT e.name, e.emoji, (
    SELECT group_concat(p.name)
      FROM events_players AS ep
      JOIN players AS p ON ep.player_id = p.id
      WHERE ep.event_id = e.id
  ) AS players
  FROM events AS e
  WHERE e.guild = ?
`;

export const getEventsDetails = async function getEventsDetails({
  guildId,
  channel,
}: {
  guildId: string;
  channel: TextChannel;
}): Promise<void> {
  const events = await dball<Event>({
    sql: getEventsDetailsSql,
    params: [guildId],
  });

  const fields: EmbedField[] = [];
  events.forEach((event) => {
    const number = event.players.split(',').length;
    const players = event.players.split(',').join(', ');

    fields.push({
      name: `${event.emoji} ${event.name}`,
      value: `${number}/5 - ${players}`,
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
