import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { VerifiedUser } from 'src/user/decorator/user.decorator';
import { BasicUserInforDto } from 'src/user/dtos/user.dto';
import { CartItemDto } from './dtos/cart.dto';

@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Roles('ADMIN', 'BASIC')
  @UseGuards(AuthGuard)
  @Post('/add')
  addToCart(
    @VerifiedUser() { id }: BasicUserInforDto,
    @Body() cartItem: CartItemDto,
  ) {
    return this.cartService.addToCart(id, cartItem);
  }
}
