import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from 'src/prisma/prisma.service';
import { JWTPayloadParams } from '../../interface/interfaces';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<ROLE[]>('role', context.getHandler());
    if (roles.length) {
      const request = context.switchToHttp().getRequest();
      const accessToken = request.headers?.authorization?.split('Bearer ')[1];
      try {
        const AccessTokenPayload = jwt.decode(accessToken) as JWTPayloadParams;
        if (roles.includes(AccessTokenPayload.role)) {
          request.userAccessToken = accessToken;
          return true;
        }
        return false;
      } catch (error) {
        return false;
      }
    }
    return true;
  }
}
