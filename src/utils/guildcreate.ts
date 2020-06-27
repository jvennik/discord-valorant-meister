import { run } from './dbrun';

const sql = `
INSERT INTO settings (guild) VALUES (?);
`;

export const guildCreate = async function createGuild(
  guildId: string
): Promise<void> {
  try {
    await run({ sql, params: [guildId] });
  } catch (e) {
    throw new Error(e);
  }
};

export default guildCreate;
