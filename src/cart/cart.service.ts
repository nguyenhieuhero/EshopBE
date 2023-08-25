import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaidCartItemDto, ResponseCartItemDto } from './dtos/cart.dto';
import { StripeService } from 'src/stripe/stripe.service';
import { ORDER_STATUS } from '@prisma/client';

const basicCartItemField = {
  product_id: true,
  quantity: true,
};
const cartItemWithProductInfor = {
  quantity: true,
  product: {
    select: {
      id: true,
      name: true,
      description: true,
      image_url: true,
      categories: {
        select: {
          id: true,
          label: true,
        },
      },
      inventory: {
        select: { price: true },
      },
    },
  },
};

interface ProductCheckoutParams {
  product_id: string;
  quantity: number;
}

@Injectable()
export class CartService {
  constructor(
    private prismaService: PrismaService,
    private stripeService: StripeService,
  ) {}
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
      select: cartItemWithProductInfor,
    });

    return {
      success: true,
      data: cartItems.map((cartItem) => new ResponseCartItemDto(cartItem)),
    };
  }
  async createcheckout(
    productCheckout: ProductCheckoutParams[],
    user_id: string,
    user_email: string,
  ) {
    await this.prismaService.order.deleteMany({
      where: { user_id, status: ORDER_STATUS.PENDING },
    });
    const _order = await this.prismaService.order.create({
      data: {
        user_id: user_id,
      },
    });
    let validItems = await Promise.all(
      productCheckout.map((product) =>
        this.prismaService.cartItem
          .findUniqueOrThrow({
            where: {
              user_id_product_id: { user_id, product_id: product.product_id },
              quantity: product.quantity,
              product: {
                inventory: {
                  quantity: { gte: product.quantity },
                },
              },
            },
            select: cartItemWithProductInfor,
          })
          .catch((error) => {
            throw new HttpException(
              {
                success: false,
                metadata: { message: 'Invalid Cart Item' },
              },
              400,
            );
          }),
      ),
    );
    const _stripeUrl = await this.stripeService.createcheckoutSession(
      validItems.map((item) => new PaidCartItemDto(item)),
      user_id,
      _order.id,
      user_email,
    );
    return { _stripeUrl };
  }
  async checkoutSession(id: string) {
    const paidSession = await this.stripeService.checkoutSession(id);
    const order = await this.prismaService.order.findUnique({
      where: { id: paidSession.order_id, user_id: paidSession.user_id },
    });
    if (order.status == ORDER_STATUS.SUCCESS) {
      throw new HttpException(
        {
          success: false,
          metadata: { message: 'Order can only paid 1 time!' },
        },
        400,
      );
    }
    await this.prismaService.order.update({
      where: { id: paidSession.order_id, user_id: paidSession.user_id },
      data: {
        status: ORDER_STATUS.SUCCESS,
        orderItems: paidSession.paidProduct,
      },
    });
    paidSession.paidProduct.forEach((_product) =>
      this.deleteFromCart(paidSession.user_id, _product.product_id),
    );
    return { success: true };
  }
}
