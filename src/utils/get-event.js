import { dbget } from "../utils/dbget";


const getEventSql = `
  SELECT id FROM events WHERE guild = ? AND owner = ?;
`;

export const getEvent = async function getEvent(guildId, owner) {
  return dbget(getEventSql, [guildId, owner], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    return row;
  });
};

export default getEvent;

