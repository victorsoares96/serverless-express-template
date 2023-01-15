import path from 'path';

import { DataSource } from 'typeorm';
import env from '@/utils/env.util';

const productionDataSource = new DataSource({
  type: env.get<never>('database.type'),
  host: env.get('database.host'),
  port: env.get('database.port'),
  username: env.get('database.username'),
  password: env.get<string>('database.password'),
  database: env.get<string>('database.name'),
  synchronize: false,
  ssl: {
    rejectUnauthorized: true,
  },
  logging: false,
  entities: [`${path.resolve(__dirname, '..', '..')}/entities/*.{js,ts}`],
  migrations: [`${path.resolve(__dirname, '..')}/migrations/*.{js,ts}`],
  subscribers: [],
});

export default productionDataSource;
