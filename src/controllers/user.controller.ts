/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request, Response } from 'express';
import {
  UpdateUserService,
  Request as UpdateRequest,
} from '@/services/user/update.service';
import {
  CreateUserService,
  Request as CreateRequest,
} from '@/services/user/create.service';
import {
  FindUserService,
  Request as FindRequest,
} from '@/services/user/find.service';
import {
  RecoverUserService,
  Request as RecoverRequest,
} from '@/services/user/recover.service';
import {
  RemoveUserService,
  Request as RemoveRequest,
} from '@/services/user/remove.service';
import {
  PasswordService,
  Request as PasswordRequest,
} from '@/services/user/password.service';

export class UsersController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { name, username, email, password } = request.body as CreateRequest;

    const createUser = new CreateUserService();

    const user = await createUser.execute({
      name,
      username,
      email,
      password,
    });

    return response.json(user);
  }

  public async index(request: Request, response: Response): Promise<Response> {
    const filters = request.body as FindRequest;

    const findUsers = new FindUserService();
    const users = await findUsers.execute(filters);

    return response.json(users);
  }

  public async recover(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const { ids } = request.body as RecoverRequest;

    const recoverUsers = new RecoverUserService();

    await recoverUsers.execute({ ids });

    return response.send();
  }

  public async remove(request: Request, response: Response): Promise<Response> {
    const { ids } = request.body as RemoveRequest;

    const removeUsers = new RemoveUserService({ softRemove: false });

    await removeUsers.execute({ ids });

    return response.send();
  }

  public async softRemove(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const { ids } = request.body as RemoveRequest;

    const softRemoveUsers = new RemoveUserService({ softRemove: true });

    await softRemoveUsers.execute({ ids });

    return response.send();
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const { id, name, email } = request.body as UpdateRequest;

    const updateUser = new UpdateUserService();

    const user = await updateUser.execute({
      id,
      name,
      email,
    });

    return response.json(user);
  }

  public async resetPassword(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const { id, currentPassword, newPassword } =
      request.body as PasswordRequest;

    const password = new PasswordService();

    await password.reset({
      id,
      currentPassword,
      newPassword,
    });

    return response.send();
  }
}
