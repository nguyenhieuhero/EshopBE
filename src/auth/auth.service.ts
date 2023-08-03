import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HelperService } from 'src/helper/helper.service';
import { Request } from 'express';
import {
  SignUpParams,
  SignInParams,
  BasicUserInforParams,
} from '../interface/interfaces';
import { JWTPayloadParams } from '../interface/interfaces';
@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private helper: HelperService,
  ) {}
  async signup({ email, password, fullname, address, phone }: SignUpParams) {
    const isExist = await this.prismaService.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (isExist) {
      throw new HttpException('Email or phone already existed!!!', 400);
    }
    const hashPass = await this.helper.hash(password);
    const user = await this.prismaService.user.create({
      data: { email, password: hashPass, fullname, address, phone },
    });
    return { message: 'success' };
  }
  async signin({ email, password }: SignInParams) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new HttpException('Not Found!', 400);
    }
    const isValidPassword = await this.helper.hashCompare(
      password,
      user.password,
    );
    if (!isValidPassword) {
      throw new HttpException('Not Found!', 400);
    }
    const accessToken = this.helper.createAcessToken({
      id: user.id,
      role: user.role,
      name: user.fullname,
    });
    const refreshToken = this.helper.createRefreshToken({
      id: user.id,
      role: user.role,
      name: user.fullname,
    });
    return { accessToken, refreshToken };
  }
  async refreshToken(
    { headers }: Request,
    { id, role, name }: JWTPayloadParams,
  ) {
    const oldRefreshToken = headers.cookie?.split('=')[1];
    if (!oldRefreshToken) {
      throw new HttpException('Token Missing!!!', 400);
    }
    try {
      const newRefreshToken = this.helper.refreshToken(oldRefreshToken);
      const newAccessToken = this.helper.createAcessToken({
        id,
        role,
        name,
      });
      return { newAccessToken, newRefreshToken };
    } catch (error) {
      throw new HttpException('Invalid Token', 400);
    }
  }
}
