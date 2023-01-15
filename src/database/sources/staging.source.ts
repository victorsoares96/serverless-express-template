import path from 'path';

import { DataSource } from 'typeorm';
import env from '@/utils/env.util';

const stagingDataSource = new DataSource({
  type: env.get<never>('database.type'),
  database: ':memory:',
  dropSchema: true,
  entities: [`${path.resolve(__dirname, '../..')}/entities/*.{js,ts}`],
  migrations: [`${path.resolve(__dirname, '..')}/migrations/staging/*.{js,ts}`],
  migrationsRun: true,
  logging: true,
});

export default stagingDataSource;
