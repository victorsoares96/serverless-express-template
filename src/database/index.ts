import 'reflect-metadata';
import { getDataSource } from './sources';

export const dataSource = getDataSource();

export const AppDataSourceInitialize = async () => {
  await dataSource.initialize();
};
