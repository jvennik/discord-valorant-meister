import { run } from "./dbrun";

const playerSql = `
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild INTEGER NOT NULL,
      name TEXT NOT NULL,
      discord_id TEXT NOT NULL,
      rank TEXT NOT NULL
    )
    `;

const eventSql = `
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild INTEGER NOT NULL,
      name TEXT NOT NULL,
      owner INTEGER NOT NULL,
      emoji TEXT NOT NULL,

      FOREIGN KEY(owner) REFERENCES players(id)
    )
    `;

const eventPlayersSql = `
    CREATE TABLE IF NOT EXISTS events_players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      player_id INTEGER NOT NULL,

      FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY(player_id) REFERENCES players(id) ON DELETE CASCADE
    )
    `;

export const DBCreate = async function createdb() {
  run(playerSql);
  run(eventSql);
  run(eventPlayersSql);
};

export default DBCreate;
