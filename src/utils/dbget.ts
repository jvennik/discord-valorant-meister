import { db } from '../db';
import { DBParams } from '../models/Db';

export const dbget = async function dbget<T>({
  sql,
  params = [],
}: {
  sql: string;
  params?: DBParams;
}): Promise<T> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        console.log('Error running sql: ' + sql);
        console.log(err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

export default dbget;
