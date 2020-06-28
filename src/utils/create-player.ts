import { run } from './dbrun';
import { dbget } from './dbget';
import Player from '../models/Player';

const playerExistsSql = `
  SELECT id FROM players WHERE guild = ? AND discord_id = ?;
`;

const createPlayerSql = `
  INSERT INTO players (guild, name, discord_id, rank) VALUES (?, ?, ?, ?);
`;

export const createPlayer = async function createPlayer({
  guildId,
  name,
  discordId,
  rank,
}: {
  guildId: string;
  name: string;
  discordId: string;
  rank: string;
}): Promise<void> {
  try {
    const result = await dbget<Player>({
      sql: playerExistsSql,
      params: [guildId, discordId],
    });

    if (!result) {
      await run({
        sql: createPlayerSql,
        params: [guildId, name, discordId, rank],
      });
    }
  } catch (e) {
    console.error('Something went wrong creating a player', e);
  }
};

export default createPlayer;
