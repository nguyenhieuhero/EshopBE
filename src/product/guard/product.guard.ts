import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductIdParamGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const productId = request.params?.productId;
    if (!productId) {
      throw new HttpException(
        {
          success: false,
          metadata: { message: 'Product Not Found!' },
        },
        404,
      );
    }
    const isExist = await this.prismaService.product.findUnique({
      where: { id: productId },
    });
    if (isExist) {
      request.idParam = productId;
      return true;
    }
    throw new HttpException(
      {
        success: false,
        metadata: { message: 'Product Not Found!' },
      },
      404,
    );
  }
}
