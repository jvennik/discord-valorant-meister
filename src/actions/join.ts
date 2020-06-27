import { run } from '../utils/dbrun';
import { dbget } from '../utils/dbget';
import { getPlayer } from '../utils/get-player';
import Event from '../models/Event';
import Player from '../models/Player';

const ranks = [
  'iron1',
  'iron2',
  'iron3',
  'bronze1',
  'bronze2',
  'bronze3',
  'silver1',
  'silver2',
  'silver3',
  'gold1',
  'gold2',
  'gold3',
  'platinum1',
  'platinum2',
  'platinum3',
  'diamond1',
  'diamond2',
  'diamond3',
  'valorant1',
  'valorant2',
  'valorant3',
];

const rankMinIndex = 0;
const rankMaxIndex = ranks.length - 1;

const playerAlreadyInEventSql = `
  SELECT 1
  FROM events_players
  WHERE event_id = ? AND player_id = ?
`;

const playerEventsSql = `
  SELECT COUNT(id) AS count
  FROM events_players
  WHERE player_id = ?
`;

const eventEmojiSql = `
  SELECT id
  FROM events
  WHERE guild = ? AND emoji = ?
`;

const eventRankSql = `
  SELECT p.rank
  FROM events AS e
  JOIN players as p on e.owner = p.id
  WHERE e.guild = ? AND e.id = ?
`;

// const playerRankSql = `
//   SELECT rank
//   FROM players
//   WHERE discord_id = ?
// `;

const joinEventSql = `
  INSERT INTO events_players (event_id, player_id) VALUES (?, ?);
`;

export enum JOIN_RESULT {
  JOINED,
  OUT_OF_RANK_RANGE,
  EVENT_DOES_NOT_EXIST,
  ALREADY_JOINED,
  OTHER_EVENT,
}

export const joinEvent = async function joinEvent({
  guildId,
  discordId,
  emoji,
}: {
  guildId: string;
  discordId: string;
  emoji: string[];
}): Promise<JOIN_RESULT> {
  const player = await getPlayer({ guildId, discordId });
  const event = await dbget<Event>({
    sql: eventEmojiSql,
    params: [guildId, emoji.toString()],
  });
  if (!event) {
    console.log('Event does not exist');
    return JOIN_RESULT.EVENT_DOES_NOT_EXIST;
  }

  const playerInEventAlready = await dbget<Player>({
    sql: playerAlreadyInEventSql,
    params: [event.id, player.id],
  });

  if (playerInEventAlready) {
    console.log('Player in event already!');
    return JOIN_RESULT.ALREADY_JOINED;
  }

  const playerEventsCount = await dbget<{ count: number }>({
    sql: playerEventsSql,
    params: [player.id],
  });

  if (playerEventsCount.count > 0) {
    console.log('Player in other event already!');
    return JOIN_RESULT.OTHER_EVENT;
  }

  const eventRank = await dbget<{ rank: string }>({
    sql: eventRankSql,
    params: [guildId, event.id],
  });
  const rankIndex = ranks.indexOf(eventRank.rank);

  let minIndex = rankMinIndex;
  if (rankIndex - 6 > rankMinIndex) {
    minIndex = rankIndex - 6;
  }

  let maxIndex = rankMaxIndex;
  if (rankIndex + 7 < rankMaxIndex) {
    maxIndex = rankIndex + 7;
  }

  const rankRange = ranks.slice(minIndex, maxIndex);

  if (rankRange.indexOf(player.rank) < 0) {
    console.log('Player rank not in range!');
    return JOIN_RESULT.OUT_OF_RANK_RANGE;
  }

  run({ sql: joinEventSql, params: [event.id, player.id] });
  return JOIN_RESULT.JOINED;
};

export default joinEvent;
