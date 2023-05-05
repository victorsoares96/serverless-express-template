import { Request, Response } from 'express';
import {
  CreateSessionService,
  Request as CreateSessionRequest,
} from '@/services/session/create.service';
import {
  RefreshSessionService,
  Request as RefreshSessionRequest,
} from '@/services/session/refresh.service';

export class SessionController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { username, password } = request.body as CreateSessionRequest;

    const session = new CreateSessionService();

    const data = await session.execute({
      username,
      password,
    });

    return response.json(data);
  }

  public async refresh(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const { refreshToken } = request.body as RefreshSessionRequest;

    const refreshSession = new RefreshSessionService();
    const session = await refreshSession.execute({ refreshToken });

    return response.json(session);
  }
}
