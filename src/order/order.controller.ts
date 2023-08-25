import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { VerifiedUser } from 'src/user/decorator/user.decorator';
import { BasicUserInforDto } from 'src/user/dtos/user.dto';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Roles('ADMIN')
  @UseGuards(AuthGuard)
  @Get()
  getAllOrder() {
    return this.orderService.getAllOrder();
  }

  @Roles('BASIC', 'ADMIN')
  @UseGuards(AuthGuard)
  @Get('/myorder')
  getMyOrder(@VerifiedUser() { id }: BasicUserInforDto) {
    return this.orderService.getMyOrder(id);
  }

  @Roles('ADMIN')
  @UseGuards(AuthGuard)
  @Get('/:id')
  getOrderById(@Param('id', ParseUUIDPipe) id: string) {
    return this.orderService.getOrderById(id);
  }
}
