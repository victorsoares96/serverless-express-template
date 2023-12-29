import { DataSource } from 'typeorm';
import productionDataSource from './sources/production.source';
import stagingDataSource from './sources/staging.source';
import developmentDataSource from './sources/development.source';

class Database {
  public dataSource: DataSource;

  constructor() {
    this.dataSource = this.getDataSource();
  }

  private getDataSource(): DataSource {
    const environment = process.env.NODE_ENV;

    if (environment === 'production') {
      return productionDataSource;
    }

    if (environment === 'staging') {
      return stagingDataSource;
    }
    return developmentDataSource;
  }

  public async connect(): Promise<DataSource> {
    return this.dataSource.initialize();
  }

  public async disconnect(): Promise<void> {
    await this.dataSource.destroy();
  }
}

export default Database;
