import { db } from "../db";

export const dbget = async function dbget(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        console.log("Error running sql: " + sql);
        console.log(err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

export default dbget;
