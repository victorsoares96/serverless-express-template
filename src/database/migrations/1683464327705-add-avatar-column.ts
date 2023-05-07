import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAvatarColumn1683464327705 implements MigrationInterface {
  name = 'AddAvatarColumn1683464327705';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD \`avatar\` varchar(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`avatar\``);
  }
}
