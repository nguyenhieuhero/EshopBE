import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { VerifiedUser } from './decorator/user.decorator';
import {
  BasicUserInforParams,
  JWTPayloadParams,
} from 'src/interface/interfaces';
import { UserService } from './user.service';
import { BasicUserInforDto, UpdateUserDto } from './dtos/user.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Roles('BASIC', 'ADMIN')
  @UseGuards(AuthGuard)
  @Get('/')
  getUserInfor(@VerifiedUser() user: BasicUserInforDto) {
    return new BasicUserInforDto(user);
  }
  @Roles('ADMIN')
  @UseGuards(AuthGuard)
  @Get('/:id')
  getUserInforById(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.getUserById(id);
  }
  @Roles('BASIC', 'ADMIN')
  @UseGuards(AuthGuard)
  @Post('/')
  updateUserInfor(
    @Body() newUserInfor: UpdateUserDto,
    @VerifiedUser() user: BasicUserInforDto,
  ) {
    return this.userService.updateUserInfor(user, newUserInfor);
  }
}
