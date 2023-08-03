import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HelperModule } from 'src/helper/helper.module';

@Module({
  imports: [PrismaModule, HelperModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
