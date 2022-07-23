import { In } from 'typeorm';
import { dataSource } from '@/database';
import { User } from '@/entities/user.entity';
import { AppError } from '@/errors/AppError';

export interface Request {
  ids: string;
}

export class RecoverUserService {
  public async execute({ ids }: Request): Promise<void> {
    if (!ids) throw new AppError('The user ids must be provided.');

    const userIds = ids.split(',');

    const users = await dataSource.manager.find(User, {
      where: { id: In(userIds) },
      withDeleted: true,
    });

    if (users.length !== userIds.length) {
      throw new AppError("Some users doesn't could be found.");
    }

    await dataSource.manager.recover(users);
  }
}
