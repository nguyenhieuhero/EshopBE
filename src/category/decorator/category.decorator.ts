import {
  ExecutionContext,
  HttpException,
  createParamDecorator,
} from '@nestjs/common';

export const GetCategoryInformation = createParamDecorator(
  (_, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    try {
      return request.body.categoryInformation
        ? JSON.parse(request.body.categoryInformation)
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
