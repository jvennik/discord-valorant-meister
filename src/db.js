const sqlite3 = require("sqlite3");
const Promise = require("bluebird");

const config = require("config");

export const db = new sqlite3.Database(config.general.dbPath, err => {
  if (err) {
    console.log("Could not connect to the DB", err);
  } else {
    console.log("Connected to the DB");
  }
});
