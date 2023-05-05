import { MigrationInterface, QueryRunner } from 'typeorm';

export class staging1683298908068 implements MigrationInterface {
  name = 'staging1683298908068';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "deletion_date" datetime, "username" varchar NOT NULL, "email" varchar NOT NULL, "password" varchar NOT NULL, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "session" ("id" varchar PRIMARY KEY NOT NULL, "expires_in" integer NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer)`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_session" ("id" varchar PRIMARY KEY NOT NULL, "expires_in" integer NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_session"("id", "expires_in", "created_at", "userId") SELECT "id", "expires_in", "created_at", "userId" FROM "session"`,
    );
    await queryRunner.query(`DROP TABLE "session"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_session" RENAME TO "session"`,
    );
    // Password: Admin@123
    await queryRunner.query(
      `INSERT INTO \`user\` (\`name\`, \`username\`, \`email\`, \`password\`) VALUES ('Admin', 'admin', 'admin@admin.com', '$2a$08$K.dwMjqI4ngCX5Ne8Y/WyOBZJ5ekncZJRU7m7VoI.yv81XR1i7fpa')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "session" RENAME TO "temporary_session"`,
    );
    await queryRunner.query(
      `CREATE TABLE "session" ("id" varchar PRIMARY KEY NOT NULL, "expires_in" integer NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer)`,
    );
    await queryRunner.query(
      `INSERT INTO "session"("id", "expires_in", "created_at", "userId") SELECT "id", "expires_in", "created_at", "userId" FROM "temporary_session"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_session"`);
    await queryRunner.query(`DROP TABLE "session"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
