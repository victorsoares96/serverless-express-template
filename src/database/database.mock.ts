import { createFakeUser } from '@/mocks/user.mock';
import Database from './database';
import { User } from '@/entities/user.entity';
import { Session } from '@/entities/session.entity';

export const DEFAULT_USERS = [
  createFakeUser({
    id: '1',
    name: 'John Doe',
    email: 'john@doe.com',
  }),
];

class MockedDatabase extends Database {
  public async clear(): Promise<void> {
    await this.dataSource.manager.delete(User, {});
    await this.dataSource.manager.delete(Session, {});
  }

  public async seed(): Promise<void> {
    await this.dataSource.manager.insert(User, DEFAULT_USERS);
  }

  public async findUser(id: string) {
    return this.dataSource.manager.findBy(User, { id });
  }

  public async createUsers(count?: number, elements?: User[]): Promise<void> {
    const documents: User[] = [
      ...Array(count || 0)
        .fill(0)
        .map(() => createFakeUser()),
    ];

    await this.dataSource.manager.insert(User, elements || documents);
  }
}

export default MockedDatabase;
