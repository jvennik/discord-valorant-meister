import { run } from './dbrun';

const deleteEventsSql = `
  DELETE FROM events WHERE guild = ?
`;

const deletePlayersSql = `
  DELETE FROM players WHERE guild = ?
`;

export const guildDelete = async function guildDelete(
  guildId: string
): Promise<void> {
  try {
    await run({ sql: deleteEventsSql, params: [guildId] });
    await run({ sql: deletePlayersSql, params: [guildId] });
  } catch (e) {
    throw new Error(e);
  }
};

export default guildDelete;
