import { run } from "./dbrun";

const sql = `
INSERT INTO settings (guild) VALUES (?);
`;

export const guildCreate = async function createGuild(guildId) {
  run(sql, [guildId], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
  });
};

export default guildCreate;
