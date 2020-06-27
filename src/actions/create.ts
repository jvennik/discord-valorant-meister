import { run } from '../utils/dbrun';
import { dbget } from '../utils/dbget';
import { getPlayer } from '../utils/get-player';
import { getEvent } from '../utils/get-event';

const numberToEmoji = {
  0: '0️⃣',
  1: '1️⃣',
  2: '2️⃣',
  3: '3️⃣',
  4: '4️⃣',
  5: '5️⃣',
  6: '6️⃣',
  7: '7️⃣',
  8: '8️⃣',
  9: '9️⃣',
  10: '🔟',
};

const eventCountSql = `SELECT COUNT(id) AS count FROM events WHERE guild = ?`;

const createEventSql = `
  INSERT INTO events (guild, name, owner, emoji) VALUES (?, ?, ?, ?);
`;

const addOwnerSql = `
  INSERT INTO events_players (event_id, player_id) VALUES (?, ?);
`;

export enum EVENT_RESULT {
  CREATED,
  MAX,
  ALREADY_OWNED,
}

export const createEvent = async function createEvent({
  guildId,
  name,
  owner,
}: {
  guildId: string;
  name: string;
  owner: string;
}): Promise<EVENT_RESULT> {
  const player = await getPlayer({ guildId, discordId: owner });

  // Check if player already owns an event
  let event = await getEvent({ guildId, owner: player.id });
  if (event) {
    // Limiting players to a single event
    console.log('Player already owns an event');
    return EVENT_RESULT.ALREADY_OWNED;
  }

  const eventCount = await dbget<{ count: number }>({
    sql: eventCountSql,
    params: [guildId],
  });
  const newEventNumber = eventCount.count as keyof typeof numberToEmoji;

  if (newEventNumber <= 10) {
    const emoji = numberToEmoji[newEventNumber];
    await run({
      sql: createEventSql,
      params: [guildId, name, player.id, emoji],
    });

    event = await getEvent({ guildId, owner: player.id });
    // Add owner to event
    await run({ sql: addOwnerSql, params: [event.id, player.id] });
  } else {
    // Limit server to 10 events for now
    return EVENT_RESULT.MAX;
  }

  return EVENT_RESULT.CREATED;
};

export default createEvent;
