import 'reflect-metadata';
import { DataSource } from 'typeorm';
import env from '@/utils/env.util';

export const dataSource = new DataSource({
  type: env.get<never>('database.type'),
  host: env.get('database.host'),
  port: env.get('database.port'),
  username: env.get('database.username'),
  password: env.get<string>('database.password'),
  database: env.get<string>('database.name'),
  synchronize: false,
  logging: false,
  entities: [`${__dirname}/entities/*.{js,ts}`],
  migrations: [`${__dirname}/migrations/*.{js,ts}`],
  subscribers: [],
});

export const AppDataSourceInitialize = async () => {
  await dataSource.initialize();
};
