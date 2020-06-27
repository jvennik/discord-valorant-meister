import { run } from "../utils/dbrun";
import { dbget } from "../utils/dbget";
import { getPlayer } from "../utils/get-player";

const ranks = [
  "iron1", "iron2", "iron3",
  "bronze1", "bronze2", "bronze3",
  "silver1", "silver2", "silver3",
  "gold1", "gold2", "gold3",
  "platinum1", "platinum2", "platinum3",
  "diamond1", "diamond2", "diamond3",
  "valorant1", "valorant2", "valorant3"
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

const playerRankSql = `
  SELECT rank
  FROM players
  WHERE discord_id = ?
`;

const joinEventSql = `
  INSERT INTO events_players (event_id, player_id) VALUES (?, ?);
`;


export const joinEvent = async function joinEvent(guildId, discordId, emoji) {
  const player = await getPlayer(guildId, discordId);
  const event = await dbget(eventEmojiSql, [guildId, emoji.toString()]);
  if (!event) {
    console.log("Event does not exist");
  }

  const playerInEventAlready = await dbget(
    playerAlreadyInEventSql, [event.id, player.id]);

  if (playerInEventAlready) {
    console.log("Player in event already!");
    return "already";
  }

  const playerEventsCount = await dbget(playerEventsSql, [player.id]);

  if (playerEventsCount.count > 0) {
    console.log("Player in other event already!");
    return "other";
  }

  const eventRank = await dbget(eventRankSql, [guildId, event.id])
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
    console.log("Player rank not in range!");
    return false;
  }

  run(joinEventSql, [event.id, player.id]);
  return "joined";
};

export default joinEvent;
