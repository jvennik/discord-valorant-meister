import { dbget } from "./dbget";

const sql = `
SELECT 1 FROM settings WHERE guild = ?
`;

export const guildExists = async function guildExists(guildId) {
  const resp = await dbget(sql, [guildId]);
  return resp;
};

export default guildExists;
