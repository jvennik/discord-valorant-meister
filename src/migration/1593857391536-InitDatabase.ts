import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitDatabase1593857391536 implements MigrationInterface {
  name = 'InitDatabase1593857391536';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "player" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "discordId" text NOT NULL, "rank" varchar NOT NULL, "joinedEventId" integer)`
    );
    await queryRunner.query(
      `CREATE TABLE "event" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "emoji" varchar NOT NULL, "guildId" varchar NOT NULL, "rank" varchar NOT NULL, "ownerId" integer, CONSTRAINT "REL_e4abcb418e46db776e920a05a1" UNIQUE ("ownerId"))`
    );
    await queryRunner.query(
      `CREATE TABLE "guild" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "guildId" varchar NOT NULL, "boundChannelId" varchar, "boundMessageId" varchar)`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_player" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "discordId" text NOT NULL, "rank" varchar NOT NULL, "joinedEventId" integer, CONSTRAINT "FK_7bf2513ceb0d6be0512aec1a40e" FOREIGN KEY ("joinedEventId") REFERENCES "event" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_player"("id", "name", "discordId", "rank", "joinedEventId") SELECT "id", "name", "discordId", "rank", "joinedEventId" FROM "player"`
    );
    await queryRunner.query(`DROP TABLE "player"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_player" RENAME TO "player"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_event" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "emoji" varchar NOT NULL, "guildId" varchar NOT NULL, "rank" varchar NOT NULL, "ownerId" integer, CONSTRAINT "REL_e4abcb418e46db776e920a05a1" UNIQUE ("ownerId"), CONSTRAINT "FK_e4abcb418e46db776e920a05a16" FOREIGN KEY ("ownerId") REFERENCES "player" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_event"("id", "name", "emoji", "guildId", "rank", "ownerId") SELECT "id", "name", "emoji", "guildId", "rank", "ownerId" FROM "event"`
    );
    await queryRunner.query(`DROP TABLE "event"`);
    await queryRunner.query(`ALTER TABLE "temporary_event" RENAME TO "event"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "event" RENAME TO "temporary_event"`);
    await queryRunner.query(
      `CREATE TABLE "event" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "emoji" varchar NOT NULL, "guildId" varchar NOT NULL, "rank" varchar NOT NULL, "ownerId" integer, CONSTRAINT "REL_e4abcb418e46db776e920a05a1" UNIQUE ("ownerId"))`
    );
    await queryRunner.query(
      `INSERT INTO "event"("id", "name", "emoji", "guildId", "rank", "ownerId") SELECT "id", "name", "emoji", "guildId", "rank", "ownerId" FROM "temporary_event"`
    );
    await queryRunner.query(`DROP TABLE "temporary_event"`);
    await queryRunner.query(
      `ALTER TABLE "player" RENAME TO "temporary_player"`
    );
    await queryRunner.query(
      `CREATE TABLE "player" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "discordId" text NOT NULL, "rank" varchar NOT NULL, "joinedEventId" integer)`
    );
    await queryRunner.query(
      `INSERT INTO "player"("id", "name", "discordId", "rank", "joinedEventId") SELECT "id", "name", "discordId", "rank", "joinedEventId" FROM "temporary_player"`
    );
    await queryRunner.query(`DROP TABLE "temporary_player"`);
    await queryRunner.query(`DROP TABLE "guild"`);
    await queryRunner.query(`DROP TABLE "event"`);
    await queryRunner.query(`DROP TABLE "player"`);
  }
}
