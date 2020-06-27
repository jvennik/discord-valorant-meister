import { dbget } from './dbget';
import Player from '../models/Player';

const getPlayerSql = `
  SELECT id, name, rank FROM players WHERE guild = ? AND discord_id = ?;
`;

export const getPlayer = async function getPlayer({
  guildId,
  discordId,
}: {
  guildId: string;
  discordId: string;
}): Promise<Player> {
  try {
    const player = await dbget<Player>({
      sql: getPlayerSql,
      params: [guildId, discordId],
    });
    console.log('PLAYER', player);
    return player;
  } catch (e) {
    console.error('Something went wrong getting a player', e);
    throw new Error(e);
  }
};

export default getPlayer;
