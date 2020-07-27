import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBoundRole1595842808231 implements MigrationInterface {
  name = 'AddBoundRole1595842808231';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "guild" ADD COLUMN boundRoleId varchar`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "guild" DROP COLUMN boundRoleId`);
  }
}
