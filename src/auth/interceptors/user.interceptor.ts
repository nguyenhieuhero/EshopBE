import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Inject,
  NestInterceptor,
} from '@nestjs/common';
import { HelperService } from 'src/helper/helper.service';
import { JWTPayloadParams } from 'src/interface/interfaces';
import { PrismaService } from 'src/prisma/prisma.service';

export class UserInterceptor implements NestInterceptor {
  constructor(
    @Inject(PrismaService) private prismaService: PrismaService,
    @Inject(HelperService) private helper: HelperService,
  ) {}
  async intercept(context: ExecutionContext, handler: CallHandler<any>) {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.userAccessToken;
    if (accessToken) {
      try {
        const AccessTokenPayload = this.helper.verifyAccessToken(
          accessToken,
        ) as JWTPayloadParams;

        const user = await this.prismaService.user.findUnique({
          where: { id: AccessTokenPayload.id },
        });
        if (user) {
          request.verifiedUser = user;
        }
      } catch (error) {
        throw new HttpException('Access Token expired!', 401);
      }
    }
    return handler.handle();
  }
}
