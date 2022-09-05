import { ILike } from 'typeorm';
import { dataSource } from '@/database';
import { User } from '@/entities/user.entity';

export interface Request {
  name?: string;
  username?: string;
  email?: string;
  isDeleted?: boolean;
  offset?: number;
  isAscending?: boolean;
  limit?: number;
}

export class FindUserService {
  public async execute(userData: Request): Promise<[User[], number]> {
    const {
      name = '',
      username = '',
      email = '',
      isDeleted = false,
      offset = 0,
      isAscending = false,
      limit = 20,
    } = userData;

    const filters = Object.entries(userData).filter(([, value]) => value);
    const query = Object.fromEntries(filters) as Partial<Request>;

    delete query.isDeleted;
    delete query.offset;
    delete query.isAscending;
    delete query.limit;

    const users = await dataSource.manager.findAndCount(User, {
      where: [
        {
          ...query,
          name: ILike(`%${name}%`),
          username: ILike(`%${username}%`),
          email: ILike(`%${email}%`),
        },
      ],
      loadEagerRelations: true,
      withDeleted: isDeleted,
      take: limit,
      skip: offset,
      order: { name: isAscending ? 'ASC' : 'DESC' },
      select: [
        'id',
        'name',
        'username',
        'email',
        'createdAt',
        'updatedAt',
        'deletionDate',
      ],
    });

    return users;
  }
}
