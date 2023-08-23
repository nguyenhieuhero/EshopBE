import { Controller, Post, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@Controller('order')
export class OrderController {
  @Roles('BASIC', 'ADMIN')
  @UseGuards(AuthGuard)
  @Post()
  createOrder() {
    return { message: 'hehe' };
  }
}
