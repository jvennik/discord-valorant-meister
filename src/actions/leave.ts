import { run } from '../utils/dbrun';
import { dbget } from '../utils/dbget';
import { getPlayer } from '../utils/get-player';
import Event from '../models/Event';
import Player from '../models/Player';

const playerEventSql = `
  SELECT e.id, e.name, e.owner
  FROM events_players AS ep
  JOIN events AS e ON ep.event_id = e.id
  JOIN players AS p ON ep.player_id = p.id
  WHERE p.id = ?
`;

const eventPlayersSql = `
  SELECT group_concat(p.name) AS players
  FROM events_players AS ep
  JOIN players AS p ON ep.player_id = p.id
  WHERE ep.event_id = ?
  ORDER BY ep.id
`;

const removePlayerSql = `
  DELETE FROM events_players WHERE player_id = ?
`;

// const deleteEventSql = `
//   DELETE FROM events WHERE id = ?;
// `;

const getPlayerByNameSql = `
  SELECT id
  FROM players
  WHERE guild = ? AND name = ?;
`;

const transferOwnerSql = `
  UPDATE events SET owner = ?
  WHERE guild = ? AND id = ?
`;

export const leaveEvent = async function leaveEvent({
  guildId,
  discordId,
}: {
  guildId: string;
  discordId: string;
}): Promise<string> {
  const player = await getPlayer({ guildId, discordId });
  const event = await dbget<Event>({
    sql: playerEventSql,
    params: [player.id],
  });

  if (event.owner === player.id) {
    // Owner is leaving, switch ownership to next player
    const eventPlayers = await dbget<Event>({
      sql: eventPlayersSql,
      params: [event.id],
    });
    const names = eventPlayers.players.split(',');
    if (names.length === 1) {
      // No one left, delete event
      // run(deleteEventSql, [event.id]);
      return `**${event.name}** has been removed`;
    } else {
      names.splice(names.indexOf(player.name, 1));
      const newOwner = names[0];
      const newOwnerPlayer = await dbget<Player>({
        sql: getPlayerByNameSql,
        params: [guildId, newOwner],
      });

      await run({
        sql: transferOwnerSql,
        params: [newOwnerPlayer.id, guildId, event.id],
      });
      await run({ sql: removePlayerSql, params: [player.id] });

      let msg = `**${player.name}** has left event: **${event.name}**.\n`;
      msg += `Ownership transferred to: **${newOwner}**`;
      return msg;
    }
  }

  await run({ sql: removePlayerSql, params: [player.id] });
  return `**${player.name}** has left group: **${event.name}**`;
};

export default leaveEvent;
