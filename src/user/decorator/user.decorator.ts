import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const User = createParamDecorator((_, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  return request.user;
});

export const VerifiedUser = createParamDecorator(
  (_, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.verifiedUser;
  },
);
