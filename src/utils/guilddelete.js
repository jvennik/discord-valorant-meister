import { run } from "./dbrun";

const deleteEventsSql = `
  DELETE FROM events WHERE guild = ?
`;

const deletePlayersSql = `
  DELETE FROM players WHERE guild = ?
`;

export const guildDelete = async function guildDelete(guildId) {
  run(deleteEventsSql, [guildId], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
  });

  run(deletePlayersSql, [guildId], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
  });
};

export default guildDelete;
