import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { ROLE } from '@prisma/client';
export class BasicUserInforDto {
  id: string;
  email: string;
  @Exclude()
  password: string;
  fullname: string;
  address: string;
  phone: string;
  role: ROLE;
  @Exclude()
  created_at: Date;
  @Exclude()
  modified_at: Date;
  constructor(partial: Partial<BasicUserInforDto>) {
    Object.assign(this, partial);
  }
}
