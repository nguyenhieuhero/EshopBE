import { Injectable } from '@nestjs/common';
import { ORDER_STATUS } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private prismaService: PrismaService) {}
  async getOrder(user_id: string) {
    const orders = await this.prismaService.order.findMany({
      where: { user_id, status: ORDER_STATUS.SUCCESS },
      select: { id: true, user_id: true, orderItems: true },
    });
    console.log(orders);
    return { orders };
  }
}
