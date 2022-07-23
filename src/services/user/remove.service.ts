import { In } from 'typeorm';
import { dataSource } from '@/database';
import { User } from '@/entities/user.entity';
import { AppError } from '@/errors/AppError';

export interface Request {
  ids: string;
}

interface IServiceOptions {
  softRemove?: boolean;
}

export class RemoveUserService {
  private softRemove = false;

  constructor(options?: IServiceOptions) {
    if (options && options.softRemove) {
      this.softRemove = options.softRemove;
    }
  }

  public async execute({ ids }: Request): Promise<void> {
    if (!ids) throw new AppError('The user ids must be provided.');

    const userIds = ids.split(',');

    const users = await dataSource.manager.find(User, {
      where: { id: In(userIds) },
    });

    if (users.length !== userIds.length) {
      throw new AppError("Some users doesn't could be found.");
    }

    if (this.softRemove) {
      await dataSource.manager.softRemove(users);
    } else {
      await dataSource.manager.remove(users);
    }
  }
}
