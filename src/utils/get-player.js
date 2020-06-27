import { dbget } from "../utils/dbget";


const getPlayerSql = `
  SELECT id, name, rank FROM players WHERE guild = ? AND discord_id = ?;
`;

export const getPlayer = async function getPlayer(guildId, discordId) {
  return dbget(getPlayerSql, [guildId, discordId], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    return row;
  });
};

export default getPlayer;
