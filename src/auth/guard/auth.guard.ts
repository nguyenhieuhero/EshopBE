import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE } from '@prisma/client';
import { HelperService } from 'src/helper/helper.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JWTPayloadParams } from '../../interface/interfaces';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private helper: HelperService,
    private prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<ROLE[]>('role', context.getHandler());
    if (roles.length) {
      const request = context.switchToHttp().getRequest();
      const accessToken = request.headers?.authorization?.split('Bearer ')[1];
      try {
        const AccessTokenPayload = this.helper.verifyAccessToken(
          accessToken,
        ) as JWTPayloadParams;

        const user = await this.prismaService.user.findUnique({
          where: { id: AccessTokenPayload.id },
        });
        if (!user) return false;
        if (roles.includes(user.role)) {
          request.verifiedUser = user;
          return true;
        } else return false;
      } catch (error) {
        return false;
      }
    }
    return true;
  }
}
