import { validate } from 'class-validator';
import { CelebrateError } from 'celebrate';
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
      throw new CelebrateError(message);
    }

    await dataSource.manager.save(updatedUser);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete updatedUser.password;

    return updatedUser;
  }
}
