import { compare, hash } from 'bcryptjs';
import { dataSource } from '@/database';
import { AppError } from '@/errors/AppError';
import { User } from '@/entities/user.entity';
import { passwordRule } from '@/utils/validators.util';

export interface Request {
  id: string;
  currentPassword: string;
  newPassword: string;
}

export class PasswordService {
  public async reset({
    id,
    currentPassword,
    newPassword,
  }: Request): Promise<void> {
    if (!id) throw new AppError('The user id must be provided.');

    if (!currentPassword)
      throw new AppError('The current password must be provided.');

    if (!newPassword) throw new AppError('The new password must be provided.');

    const user = await dataSource.manager.findOne(User, {
      where: { id },
    });

    if (!user) throw new AppError('The user does not exist.');

    const isValid = await compare(currentPassword, user.password);

    if (!isValid) throw new AppError('The current password is invalid.');

    if (!passwordRule.test(newPassword)) {
      throw new AppError(
        'Password must be at least 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character.',
      );
    }

    const hashedPassword = await hash(newPassword, 8);

    user.password = hashedPassword;

    await dataSource.manager.save(user);
  }
}
