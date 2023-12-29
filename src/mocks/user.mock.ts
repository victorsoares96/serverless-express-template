import { faker } from '@faker-js/faker';
import { User } from '@/entities/user.entity';

export function createFakeUser(data?: Partial<User>): User {
  const createdAt = faker.date.past();
  return {
    id: faker.string.numeric(5),
    name: faker.internet.displayName(),
    avatar: faker.internet.avatar(),
    createdAt,
    updatedAt: createdAt,
    deletionDate: null as never,
    username: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    ...data,
  };
}
