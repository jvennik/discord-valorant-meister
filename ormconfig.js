const devConfig = {
  type: 'sqlite',
  database: 'db/db.sqlite3',
  synchronize: true,
  logging: true,
  entities: ['src/entity/**/*.ts'],
  migrations: ['src/migration/**/*.ts'],
};

const prodConfig = {
  type: 'sqlite',
  database: 'db/db.sqlite3',
  synchronize: true,
  logging: true,
  entities: ['dist/entity/**/*.js'],
  migrations: ['dist/migration/**/*.js'],
};

module.exports = process.env.TS_NODE ? devConfig : prodConfig;
