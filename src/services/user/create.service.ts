import { hash } from 'bcryptjs';
import { validate } from 'class-validator';
import { CelebrateError } from 'celebrate';
import { dataSource } from '@/database';
import { User } from '@/entities/user.entity';
import { AppError } from '@/errors/AppError';

export interface Request {
  name: string;
  username: string;
  email: string;
  password: string;
}

export class CreateUserService {
  public async execute({
    name,
    username,
    email,
    password,
  }: Request): Promise<User> {
    const userExists = await dataSource.manager.findOne(User, {
      where: [{ name }, { email }, { username }],
    });

    if (userExists) throw new AppError('User already exists.');

    const user = dataSource.manager.create(User, {
      name,
      username,
      email,
      password,
    });

    const [error] = await validate(user, {
      stopAtFirstError: true,
    });

    if (error && error.constraints) {
      const [message] = Object.values(error.constraints);
      throw new CelebrateError(message);
    }

    const hashPassword = await hash(password, 8);

    user.password = hashPassword;

    await dataSource.manager.save(user);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete user.password;

    return user;
  }
}
