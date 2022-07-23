import { Request, Response } from 'express';
import {
  AuthenticateService,
  Request as AuthRequest,
} from '@/services/authenticate/authenticate.service';

export class AuthenticateController {
  public async execute(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const { username, password } = request.body as AuthRequest;

    const authenticate = new AuthenticateService();

    const data = await authenticate.execute({
      username,
      password,
    });

    return response.json(data);
  }
}
