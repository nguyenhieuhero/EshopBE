import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export class UserInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, handler: CallHandler<any>) {
    const request = context.switchToHttp().getRequest();
    const accessToken = request?.headers?.authorization?.split('Bearer ')[1];
    const user = await jwt.decode(accessToken);
    request.user = user;
    return handler.handle();
  }
}
