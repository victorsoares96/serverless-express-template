import { DataSource } from 'typeorm';
import developmentDataSource from './development.source';
import productionDataSource from './production.source';
import stagingDataSource from './staging.source';

export function getDataSource(): DataSource {
  const environment = process.env.NODE_ENV;

  if (environment === 'production') {
    return productionDataSource;
  }

  if (environment === 'staging') {
    return stagingDataSource;
  }
  return developmentDataSource;
}
