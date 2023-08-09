import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { HelperModule } from 'src/helper/helper.module';
import { GoogleCloudService } from 'src/googlecloud/googlecloud.service';

@Module({
  imports: [PrismaModule, AuthModule, HelperModule],
  controllers: [UserController],
  providers: [UserService, GoogleCloudService],
})
export class UserModule {}
