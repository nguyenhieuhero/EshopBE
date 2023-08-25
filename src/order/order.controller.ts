import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { VerifiedUser } from 'src/user/decorator/user.decorator';
import { BasicUserInforDto } from 'src/user/dtos/user.dto';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Roles('BASIC', 'ADMIN')
  @UseGuards(AuthGuard)
  @Get()
  createOrder(@VerifiedUser() { id }: BasicUserInforDto) {
    return this.orderService.getOrder(id);
  }
}
