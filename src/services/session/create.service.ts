import { compare } from 'bcryptjs';
import dayjs from 'dayjs';
import { dataSource } from '@/database';
import { User } from '@/entities/user.entity';
import { AppError } from '@/errors/AppError';
import { TokenProvider } from '@/utils/token.util';
import { Session } from '@/entities/session.entity';

export interface Request {
  username: string;
  password: string;
}

export interface Response {
  user: User;
  token: string;
  refreshToken: {
    id: Session['id'];
    userId: User['id'];
    expiresIn: Session['expiresIn'];
  };
}

export class CreateSessionService {
  private tokenProvider: TokenProvider;

  constructor() {
    this.tokenProvider = new TokenProvider();
  }

  private async createRefreshToken(userId: User['id']) {
    const expiresIn = dayjs().add(30, 'day').unix();

    const user = await dataSource.manager.findOneBy(User, { id: userId });

    if (!user) {
      throw new AppError('This user could not be found');
    }

    const session = await dataSource.manager.create(Session, {
      user,
      expiresIn,
    });

    await dataSource.manager.save(session);

    return {
      id: session.id,
      userId: session.user.id,
      expiresIn: session.expiresIn,
    };
  }

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

    const token = this.tokenProvider.generate(user.username, user.id);

    await dataSource.manager.delete(Session, {
      user: { id: user.id },
    });

    const refreshToken = await this.createRefreshToken(user.id);

    // user.lastAccess = new Date().toISOString();
    // await this.usersRepository.update([user]);

    // @ts-ignore
    delete user.password;

    return { user, token, refreshToken };
  }
}
