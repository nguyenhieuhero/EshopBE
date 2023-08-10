import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HelperService } from 'src/helper/helper.service';
import { Request } from 'express';
import { SignUpParams, SignInParams } from '../interface/interfaces';
import { JWTPayloadParams } from '../interface/interfaces';
import { GoogleCloudService } from 'src/googlecloud/googlecloud.service';
import * as fs from 'fs';
import { firebasePath } from 'src/enum/enum';
@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private helper: HelperService,
    private googleCloudService: GoogleCloudService,
  ) {}
  async signup({ email, password, fullname, address, phone }: SignUpParams) {
    const isExist = await this.prismaService.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (isExist) {
      throw new HttpException('Email or phone already existed!!!', 400);
    }
    const defaulImg = fs.readFileSync('assets//Male_Avatar.jpg');
    const url = await this.googleCloudService.upload(
      defaulImg,
      firebasePath.USER,
    );
    const hashPass = await this.helper.hash(password);
    const user = await this.prismaService.user.create({
      data: {
        email,
        password: hashPass,
        fullname,
        address,
        phone,
        image_url: url,
      },
    });
    return { message: 'Đăng ký thành công', success: true };
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
  async refreshToken(request: Request) {
    const oldRefreshToken = request.cookies['RefreshToken'];
    const oldAccessToken = request.headers?.authorization?.split('Bearer ')[1];
    if (!oldRefreshToken || !oldAccessToken) {
      throw new HttpException('Token Missing!!!', 400);
    }
    try {
      const refreshTokenPayload = this.helper.verifyRefeshToken(
        oldRefreshToken,
      ) as JWTPayloadParams;
      const accessTokenPayload = this.helper.decode(
        oldAccessToken,
      ) as JWTPayloadParams;
      if (
        refreshTokenPayload.id === accessTokenPayload.id &&
        refreshTokenPayload.role === accessTokenPayload.role &&
        refreshTokenPayload.name === accessTokenPayload.name
      ) {
        const newRefreshToken = this.helper.refreshToken(oldRefreshToken);
        const newAccessToken = this.helper.createAcessToken({
          id: accessTokenPayload.id,
          role: accessTokenPayload.role,
          name: accessTokenPayload.name,
        });
        return { newAccessToken, newRefreshToken };
      } else {
        throw new HttpException('Invalid Token', 401);
      }
    } catch (error) {
      throw new HttpException('Invalid Token', 401);
    }
  }
}
