import sqlite3 from 'sqlite3';
import config from 'config';

export const db = new sqlite3.Database(
  config.get<string>('general.dbPath'),
  (err) => {
    if (err) {
      console.log('Could not connect to the DB', err);
    } else {
      console.log('Connected to the DB');
    }
  }
);
