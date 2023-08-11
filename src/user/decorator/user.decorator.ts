import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const VerifiedUser = createParamDecorator(
  (_, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.verifiedUser;
  },
);

export const GetUserInformation = createParamDecorator(
  (_, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.body.userInformation
      ? JSON.parse(request.body.userInformation)
      : undefined;
  },
);
