import { db } from "../db";

export const dball = async function dball(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, row) => {
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

export default dball;
