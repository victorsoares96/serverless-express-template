import dayjs from 'dayjs';
import { dataSource } from '@/database';
import { Session } from '@/entities/session.entity';
import { AppError } from '@/errors/AppError';
import { TokenProvider } from '@/utils/token.util';
import { User } from '@/entities/user.entity';

export interface Request {
  refreshToken: string;
}

interface Response {
  token: string;
  refreshToken: {
    id: Session['id'];
    expiresIn: Session['expiresIn'];
    userId: User['id'];
  };
}

export class RefreshSessionService {
  private tokenProvider: TokenProvider;

  constructor() {
    this.tokenProvider = new TokenProvider();
  }

  public async execute(data: Request): Promise<Response> {
    const session = await dataSource.manager.findOne(Session, {
      where: { id: data.refreshToken },
      loadEagerRelations: true,
    });

    if (!session) {
      throw new AppError('session is required', 403);
    }

    const sessionExpired = dayjs().isAfter(dayjs.unix(session.expiresIn));

    if (sessionExpired) {
      await dataSource.manager.remove(Session, session);
      throw new AppError('session invalid', 403);
    }

    const token = await this.tokenProvider.generate(
      session.user.username,
      session.user.id,
    );

    return {
      token,
      refreshToken: {
        id: session.id,
        expiresIn: session.expiresIn,
        userId: session.user.id,
      },
    };
  }
}
