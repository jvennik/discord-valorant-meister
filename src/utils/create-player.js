import { run } from "./dbrun";
import { dbget } from "./dbget";

const playerExistsSql = `
  SELECT id FROM players WHERE guild = ? AND discord_id = ?;
`;

const createPlayerSql = `
  INSERT INTO players (guild, name, discord_id, rank) VALUES (?, ?, ?, ?);
`;

export const createPlayer = async function createPlayer(guildId, name, discordId, rank) {
  const result = await dbget(playerExistsSql, [guildId, discordId], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    return row;
  });

  if (!result) {
    run(createPlayerSql, [guildId, name, discordId, rank], (err, row) => {
      if (err) {
        return console.error(err.message);
      }
    });
  }
};

export default createPlayer;
