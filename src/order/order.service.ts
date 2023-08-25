import { HttpException, Injectable } from '@nestjs/common';
import { ORDER_STATUS } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private prismaService: PrismaService) {}
  async getMyOrder(user_id: string) {
    const order = await this.prismaService.order.findMany({
      where: { user_id, status: ORDER_STATUS.SUCCESS },
      select: { id: true, orderItems: true },
    });
    return { success: true, data: order };
  }

  async getAllOrder() {
    const orders = await this.prismaService.order.findMany({
      where: { status: ORDER_STATUS.SUCCESS },
      select: { id: true, user_id: true, orderItems: true },
    });
    return { success: true, data: orders };
  }

  async getOrderById(id: string) {
    const order = await this.prismaService.order.findUnique({
      where: { id },
      select: { id: true, user_id: true, orderItems: true },
    });
    if (!order) {
      throw new HttpException(
        {
          success: true,
          metadata: { message: 'Not Found!' },
        },
        404,
      );
    }
    return { success: true, data: order };
  }
}
