import {
  ExecutionContext,
  HttpException,
  createParamDecorator,
} from '@nestjs/common';

export const GetProductInformation = createParamDecorator(
  (_, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    try {
      return request.body.productInformation
        ? JSON.parse(request.body.productInformation)
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
