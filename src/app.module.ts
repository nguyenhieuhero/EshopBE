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

@Module({
  imports: [PrismaModule, AuthModule, HelperModule, UserModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: UserInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
