import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HelperModule } from 'src/helper/helper.module';
import { GoogleCloudService } from 'src/googlecloud/googlecloud.service';

@Module({
  imports: [PrismaModule, HelperModule],
  controllers: [AuthController],
  providers: [AuthService, GoogleCloudService],
})
export class AuthModule {}
