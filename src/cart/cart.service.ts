import { Injectable } from '@nestjs/common';
import { CartItemParams } from 'src/interface/interfaces';
import { PrismaService } from 'src/prisma/prisma.service';

const basicCartItemField = {
  product_id: true,
  user_id: true,
  quantity: true,
};
@Injectable()
export class CartService {
  constructor(private prismaService: PrismaService) {}
  async addToCart(user_id: string, { product_id, quantity }: CartItemParams) {
    const isExist = await this.prismaService.cartItem.findUnique({
      where: { user_id_product_id: { user_id, product_id } },
    });
    if (!isExist) {
      const newCartItem = await this.prismaService.cartItem.create({
        data: { user_id, product_id, quantity },
        select: basicCartItemField,
      });
      return { success: true, data: newCartItem };
    }
    const cartItem = await this.prismaService.cartItem.update({
      where: { user_id_product_id: { user_id, product_id } },
      data: { quantity: { increment: quantity > 0 ? quantity : 0 } },
      select: basicCartItemField,
    });
    return { success: true, data: cartItem };
  }
}
