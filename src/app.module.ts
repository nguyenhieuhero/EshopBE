import { Module, Scope } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { HelperModule } from './helper/helper.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UserInterceptor } from './auth/interceptors/user.interceptor';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { HelperService } from './helper/helper.service';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [PrismaModule, AuthModule, HelperModule, UserModule, ProductModule, CategoryModule],
  controllers: [AppController],
  providers: [
    AppService,
    HelperService,
    {
      provide: APP_INTERCEPTOR,
      scope: Scope.REQUEST,
      useClass: UserInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
