import { validate } from 'class-validator';
import { CelebrateError } from 'celebrate';
import { UploadedFile } from 'express-fileupload';
import { dataSource } from '@/database';
import { User } from '@/entities/user.entity';
import { AppError } from '@/errors/AppError';
import Storage from '@/utils/storage.util';

export interface Request {
  id: User['id'];
  avatar: UploadedFile;
}

export class ChangeUserAvatarService {
  private storage: Storage;

  constructor() {
    this.storage = new Storage();
  }

  public async execute({ id, avatar }: Request): Promise<void> {
    const user = await dataSource.manager.findOneBy(User, { id });

    if (!user) throw new AppError('The user could not be found');

    const url = await this.storage.uploadObject(
      `${Date.now()}_${avatar.name}`,
      avatar.data,
      avatar.mimetype,
    );

    user.avatar = url;

    const [error] = await validate(user, {
      stopAtFirstError: true,
    });

    if (error && error.constraints) {
      const [message] = Object.values(error.constraints);
      throw new CelebrateError(message);
    }

    await dataSource.manager.save(user);
  }
}
