import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private prismaService: PrismaService) {}
  async getOrder(user_id: string) {
    const orders = await this.prismaService.order.findMany({
      where: { user_id },
      select: { id: true, orderItems: true },
    });
    console.log(orders);
    return { orders };
  }
}
