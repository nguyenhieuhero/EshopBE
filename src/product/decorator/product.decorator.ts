import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const GetProduct = createParamDecorator(
  (_, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.body.productInformation
      ? JSON.parse(request.body.productInformation)
      : undefined;
  },
);
