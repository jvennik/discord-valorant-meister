import { run } from "../utils/dbrun";
import { dbget } from "../utils/dbget";
import { getPlayer } from "../utils/get-player";
import { getEvent } from "../utils/get-event";


const numberToEmoji = {
  0: "0️⃣",
  1: "1️⃣",
  2: "2️⃣",
  3: "3️⃣",
  4: "4️⃣",
  5: "5️⃣",
  6: "6️⃣",
  7: "7️⃣",
  8: "8️⃣",
  9: "9️⃣",
  10: "🔟"
};


const eventCountSql = `SELECT COUNT(id) AS count FROM events WHERE guild = ?`;

const createEventSql = `
  INSERT INTO events (guild, name, owner, emoji) VALUES (?, ?, ?, ?);
`;

const addOwnerSql = `
  INSERT INTO events_players (event_id, player_id) VALUES (?, ?);
`;


export const createEvent = async function createEvent(guildId, name, owner) {
  const player = await getPlayer(guildId, owner);

  // Check if player already owns an event
  let event = await getEvent(guildId, player.id);
  if (event) {
    // Limiting players to a single event
    console.log("Player already owns an event");
    return "alreadyOwned";
  }

	const eventCount = await dbget(eventCountSql, [guildId]);
	const newEventNumber = eventCount.count;

	if (newEventNumber <= 10) {
    const emoji = numberToEmoji[newEventNumber];
		run(createEventSql, [guildId, name, player.id, emoji]);

		event = await getEvent(guildId, player.id);
		// Add owner to event
		run(addOwnerSql, [event.id, player.id]);
  } else {
    // Limit server to 10 events for now
    return "max";
  }

  return "created";
};

export default createEvent;
