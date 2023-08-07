import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  IsOptional,
} from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { ROLE } from '@prisma/client';
export class BasicUserInforDto {
  @Exclude()
  id: string;
  email: string;
  @Exclude()
  password: string;
  fullname: string;
  address: string;
  phone: string;
  role: ROLE;
  image_url: string;
  @Exclude()
  created_at: Date;
  @Exclude()
  modified_at: Date;
  constructor(partial: Partial<BasicUserInforDto>) {
    Object.assign(this, partial);
  }
}
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsOptional()
  @IsString()
  @Matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/g)
  phone: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  password: string;
}
