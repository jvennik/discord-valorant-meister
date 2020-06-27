import { dbget } from './dbget';

const sql = `
SELECT 1 FROM settings WHERE guild = ?
`;

export const guildExists = async function guildExists(
  guildId: string
): Promise<boolean> {
  const resp = await dbget({ sql, params: [guildId] });
  return !!resp;
};

export default guildExists;
