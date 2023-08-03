import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { HelperModule } from 'src/helper/helper.module';

@Module({
  imports: [PrismaModule, AuthModule, HelperModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
