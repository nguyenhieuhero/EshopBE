import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpException,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { VerifiedUser } from 'src/user/decorator/user.decorator';
import { BasicUserInforDto } from 'src/user/dtos/user.dto';
import { CartItemDto } from './dtos/cart.dto';
import { ProductIdParamGuard } from 'src/product/guard/product.guard';

@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Roles('ADMIN', 'BASIC')
  @UseGuards(AuthGuard)
  @Get()
  getMyCart(@VerifiedUser() { id }: BasicUserInforDto) {
    return this.cartService.getMyCartItems(id);
  }

  @Roles('ADMIN', 'BASIC')
  @UseGuards(AuthGuard)
  @UseGuards(ProductIdParamGuard)
  @Put('/:productId')
  updateCartItem(
    @VerifiedUser() { id }: BasicUserInforDto,
    @Param('productId') productId: string,
    @Query('quantity', ParseIntPipe) quantity: number,
  ) {
    if (quantity <= 0) {
      throw new HttpException(
        {
          success: false,
          metadata: { message: 'Quantity must greater than 0' },
        },
        400,
      );
    }
    return this.cartService.updateCartItem(id, productId, quantity);
  }

  @Roles('ADMIN', 'BASIC')
  @UseGuards(AuthGuard)
  @UseGuards(ProductIdParamGuard)
  @Post('/add/:productId')
  addToCart(
    @VerifiedUser() { id }: BasicUserInforDto,
    @Param('productId') productId: string,
    @Query('quantity', new DefaultValuePipe(1), ParseIntPipe) quantity: number,
  ) {
    if (quantity <= 0) {
      throw new HttpException(
        {
          success: false,
          metadata: { message: 'Quantity must greater than 0' },
        },
        400,
      );
    }
    console.log(id, productId, quantity);
    return this.cartService.addToCart(id, productId, quantity);
  }

  @Roles('ADMIN', 'BASIC')
  @UseGuards(AuthGuard)
  @UseGuards(ProductIdParamGuard)
  @Delete('/delete/:productId')
  deleteFromCart(
    @VerifiedUser() { id }: BasicUserInforDto,
    @Param('productId') productId: string,
  ) {
    return this.cartService.deleteFromCart(id, productId);
  }
}
