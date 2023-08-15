import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HelperService } from 'src/helper/helper.service';
import { Request, Response } from 'express';
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
      throw new HttpException(
        {
          success: false,
          metadata: { message: 'Email or phone already existed!!!' },
        },
        400,
      );
    }
    const defaulImg = fs.readFileSync('assets//Male_Avatar.jpg');
    const url = await this.googleCloudService.upload(
      defaulImg,
      firebasePath.USER,
    );
    const hashPass = await this.helper.hash(password);
    try {
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
      return { success: true };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          metadata: { message: error.message },
        },
        400,
      );
    }
  }
  async signin({ email, password }: SignInParams, response: Response) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new HttpException(
        {
          success: false,
          metadata: { message: 'Invalid email or password' },
        },
        400,
      );
    }
    const isValidPassword = await this.helper.hashCompare(
      password,
      user.password,
    );
    if (!isValidPassword) {
      throw new HttpException(
        {
          success: false,
          metadata: { message: 'Invalid email or password' },
        },
        400,
      );
    }
    const accessToken = this.helper.createAcessToken({
      id: user.id,
      role: user.role,
      name: user.fullname,
    });
    const { refreshToken, expiredDate } = this.helper.createRefreshToken({
      id: user.id,
      role: user.role,
      name: user.fullname,
    });

    response.cookie('RefreshToken', refreshToken, {
      httpOnly: true,
      expires: expiredDate,
    });
    response.send({
      success: true,
      AccessToken: accessToken,
    });
  }
  async refreshToken(request: Request, response: Response) {
    const oldRefreshToken = request.cookies['RefreshToken'];
    const oldAccessToken = request.headers?.authorization?.split('Bearer ')[1];
    if (!oldRefreshToken || !oldAccessToken) {
      throw new HttpException(
        {
          success: false,
          metadata: { message: 'Token Missing!' },
        },
        400,
      );
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
        const { newRefreshToken, expiredDate } =
          this.helper.refreshToken(oldRefreshToken);
        const newAccessToken = this.helper.createAcessToken({
          id: accessTokenPayload.id,
          role: accessTokenPayload.role,
          name: accessTokenPayload.name,
        });
        response.cookie('RefreshToken', newRefreshToken, {
          httpOnly: true,
          expires: expiredDate,
        });
        response.send({
          success: true,
          AccessToken: newAccessToken,
        });
      } else {
        throw new HttpException(
          {
            success: false,
            metadata: { message: 'Invalid Token!' },
          },
          400,
        );
      }
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          metadata: { message: error.message },
        },
        400,
      );
    }
  }
}
