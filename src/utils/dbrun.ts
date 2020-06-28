import { db } from '../db';
import { DBParams } from '../models/Db';

export const run = async function run({
  sql,
  params = [],
}: {
  sql: string;
  params?: DBParams;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        console.log('Error running sql: ' + sql);
        console.log(err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

export default run;
