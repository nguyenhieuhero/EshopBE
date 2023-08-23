import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StripeService } from 'src/stripe/stripe.service';

@Module({
  imports: [PrismaModule],
  controllers: [CartController],
  providers: [CartService, StripeService],
})
export class CartModule {}
