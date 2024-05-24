import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsValidPassword } from './decorators/isValidPassword';
import { Session } from './session.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column({ name: 'name' })
  @IsNotEmpty({ message: 'Name is required.' })
  name: string;

  @Column({ name: 'avatar', nullable: true, default: null, type: String })
  @IsOptional()
  avatar: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deletion_date' })
  deletionDate: Date;

  @Column({ name: 'username', unique: true })
  @MinLength(5, { message: 'Username is too short.' })
  @MaxLength(15, { message: 'Username is too long.' })
  username: string;

  @Column({ name: 'email', unique: true })
  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail({}, { message: 'Email is invalid.' })
  email: string;

  @Column({ name: 'password' })
  @IsNotEmpty({ message: 'Password is required.' })
  @IsValidPassword({
    message:
      'Password must be at least 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character.',
  })
  password: string;

  @OneToMany(() => Session, session => session.user, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  sessions?: Session[];
}
