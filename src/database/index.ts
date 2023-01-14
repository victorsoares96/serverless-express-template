import 'reflect-metadata';
import path from 'path';
import { DataSource } from 'typeorm';
import env from '@/utils/env.util';

export const dataSource = new DataSource(
  process.env.NODE_ENV === 'staging'
    ? {
        type: env.get<never>('database.type'),
        database: ':memory:',
        dropSchema: true,
        entities: [`${path.resolve(__dirname, '..')}/entities/*.{js,ts}`],
        migrations: [
          `${path.resolve(
            __dirname,
            '../database',
          )}/migrations/staging/*.{js,ts}`,
        ],
        migrationsRun: true,
        logging: true,
      }
    : {
        type: env.get<never>('database.type'),
        host: env.get('database.host'),
        port: env.get('database.port'),
        username: env.get('database.username'),
        password: env.get<string>('database.password'),
        database: env.get<string>('database.name'),
        synchronize: false,
        logging: true,
        entities: [`${path.resolve(__dirname, '..')}/entities/*.{js,ts}`],
        migrations: [
          `${path.resolve(__dirname, '../database')}/migrations/*.{js,ts}`,
        ],
        subscribers: [],
      },
);

export const AppDataSourceInitialize = async () => {
  await dataSource.initialize();
};
