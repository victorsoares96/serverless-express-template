import { MigrationInterface, QueryRunner } from 'typeorm';

export class migrations1673730178240 implements MigrationInterface {
  name = 'migrations1673730178240';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "deletion_date" datetime, "username" varchar NOT NULL, "email" varchar NOT NULL, "password" varchar NOT NULL, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"))`,
    );
    // Password: Admin@123
    await queryRunner.query(
      `INSERT INTO "user" ("name", "username", "email", "password") VALUES ('Admin', 'admin', 'admin@admin.com', '$2a$08$K.dwMjqI4ngCX5Ne8Y/WyOBZJ5ekncZJRU7m7VoI.yv81XR1i7fpa')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
