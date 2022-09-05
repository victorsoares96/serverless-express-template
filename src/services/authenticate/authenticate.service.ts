import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { dataSource } from '@/database';
import { User } from '@/entities/user.entity';
import { AppError } from '@/errors/AppError';
import authConfig from '@/config/auth';

export interface Request {
  username: string;
  password: string;
}

export interface Response {
  user: User;
  token: string;
}

export class AuthenticateService {
  public async execute({ username, password }: Request): Promise<Response> {
    const user = await dataSource.manager.findOne(User, {
      where: { username },
    });

    if (!user) {
      throw new AppError(
        'Invalid username or password. Please, try again.',
        401,
      );
    }

    const passwordMatched = await compare(password, user.password);

    if (!passwordMatched) {
      throw new AppError(
        'Invalid username or password. Please, try again.',
        401,
      );
    }

    const { secret, expiresIn } = authConfig.jwt;
    const token = sign({ name: user.name }, secret, {
      subject: String(user.id),
      expiresIn,
    });

    await dataSource.manager.save(user);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete user.password;

    return { user, token };
  }
}
