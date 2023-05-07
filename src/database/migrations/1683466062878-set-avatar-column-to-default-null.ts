import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetAvatarColumnToDefaultNull1683466062878
  implements MigrationInterface
{
  name = 'SetAvatarColumnToDefaultNull1683466062878';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`avatar\` \`avatar\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`avatar\` \`avatar\` varchar(255) NOT NULL`,
    );
  }
}
