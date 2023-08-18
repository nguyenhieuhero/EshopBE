import { HttpException, Injectable } from '@nestjs/common';
import { CartItemParams } from 'src/interface/interfaces';
import { PrismaService } from 'src/prisma/prisma.service';

const basicCartItemField = {
  product_id: true,
  quantity: true,
};
@Injectable()
export class CartService {
  constructor(private prismaService: PrismaService) {}
  async addToCart(user_id: string, product_id: string, quantity: number) {
    const isExist = await this.prismaService.cartItem.findUnique({
      where: { user_id_product_id: { user_id, product_id } },
    });
    if (!isExist) {
      const newCartItem = await this.prismaService.cartItem.create({
        data: { user_id, product_id, quantity },
        select: basicCartItemField,
      });
      return {
        success: true,
        data: newCartItem,
        metadata: { message: 'Create cart Item successfully!' },
      };
    }
    const cartItem = await this.prismaService.cartItem.update({
      where: { user_id_product_id: { user_id, product_id } },
      data: { quantity: { increment: quantity > 0 ? quantity : 1 } },
      select: basicCartItemField,
    });
    return {
      success: true,
      data: cartItem,
      metadata: { message: 'Update cart Item successfully!' },
    };
  }

  async deleteFromCart(user_id: string, product_id: string) {
    try {
      const cartItem = await this.prismaService.cartItem.delete({
        where: { user_id_product_id: { user_id, product_id } },
        select: basicCartItemField,
      });
      return {
        success: true,
        data: cartItem,
        metadata: { message: 'Cart Item delete successfuly!' },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          metadata: { message: 'Item not exist in cart' },
        },
        400,
      );
    }
  }

  async updateCartItem(user_id: string, product_id: string, quantity: number) {
    try {
      const cartItem = await this.prismaService.cartItem.update({
        where: { user_id_product_id: { user_id, product_id } },
        data: { product_id, quantity },
        select: basicCartItemField,
      });
      return {
        success: true,
        data: cartItem,
        metadata: { message: 'Update cart Item successfully!' },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          metadata: { message: 'Cart Item Not Found!' },
        },
        404,
      );
    }
  }
  async getMyCartItems(user_id: string) {
    const cartItems = await this.prismaService.cartItem.findMany({
      where: { user_id },
      select: basicCartItemField,
    });
    return {
      success: true,
      data: cartItems,
    };
  }
}
