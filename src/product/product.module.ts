import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { GoogleCloudService } from 'src/googlecloud/googlecloud.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProductController],
  providers: [ProductService, GoogleCloudService],
})
export class ProductModule {}
