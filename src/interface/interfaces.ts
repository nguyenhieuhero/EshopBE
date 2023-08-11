import { UpdateUserDto } from 'src/user/dtos/user.dto';
import { ROLE } from '@prisma/client';

export interface JWTPayloadParams {
  id: string;
  name: string;
  role: ROLE;
  iat: number;
  exp: number;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface SignUpParams extends SignInParams {
  fullname: string;
  address: string;
  phone: string;
}

export interface VerifiedUserParams {
  id: string;
  email: string;
  fullname: string;
  address: string;
  phone: string;
  image_url: string;
  role: ROLE;
  created_at: Date;
  modified_at: Date;
}

export interface BasicUserInforParams {
  email: string;
  fullname: string;
  address: string;
  phone: string;
  image_url: string;
  role: ROLE;
}

export interface UpdateUserParams {
  fullname?: string;
  address?: string;
  phone?: string;
  password?: string;
}

export interface CreateCategoryParams {
  label: string;
  description: string;
}

export interface CreateProductParams {
  name: string;
  price: number;
  description: string;
  quantity: number;
  categories: number[];
}

export interface QueryProductParams {
  name?: { contains?: string };
  price?: {
    gte?: number;
    lte?: number;
  };
}
