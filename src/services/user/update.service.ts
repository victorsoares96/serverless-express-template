import { validate } from 'class-validator';
import { dataSource } from '@/database';
import { User } from '@/entities/user.entity';

import { AppError } from '@/errors/AppError';

export interface Request {
  id: string;
  name?: string;
  email?: string;
}

export class UpdateUserService {
  public async execute(userData: Request): Promise<User> {
    const { id } = userData;

    if (!id) throw new AppError('The user id must be provided.');

    const user = await dataSource.manager.findOne(User, {
      where: { id },
    });

    if (!user) throw new AppError('The user does not exist.');

    const updatedUser: User = {
      ...user,
      ...userData,
    };

    const [error] = await validate(updatedUser, {
      stopAtFirstError: true,
    });

    if (error && error.constraints) {
      const [message] = Object.values(error.constraints);
      throw new AppError(message);
    }

    await dataSource.manager.save(updatedUser);

    return updatedUser;
  }
}
