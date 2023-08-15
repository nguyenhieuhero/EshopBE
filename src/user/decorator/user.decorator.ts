import {
  ExecutionContext,
  HttpException,
  createParamDecorator,
} from '@nestjs/common';

export const VerifiedUser = createParamDecorator(
  (_, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.verifiedUser;
  },
);

export const GetUserInformation = createParamDecorator(
  (_, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    try {
      return request.body.userInformation
        ? JSON.parse(request.body.userInformation)
        : undefined;
    } catch (error) {
      return new HttpException(
        {
          success: false,
          metadata: { message: 'Invalid Syntax' },
        },
        400,
      );
    }
  },
);
