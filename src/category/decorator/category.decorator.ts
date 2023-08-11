import {
  ExecutionContext,
  HttpException,
  createParamDecorator,
} from '@nestjs/common';

export const GetCategoryInformation = createParamDecorator(
  (_, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    console.log(request.body);

    return request.body.categoryInformation
      ? JSON.parse(request.body.categoryInformation)
      : undefined;
  },
);
