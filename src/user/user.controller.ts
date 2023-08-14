import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { VerifiedUser, GetUserInformation } from './decorator/user.decorator';
import {
  BasicUserInforParams,
  JWTPayloadParams,
} from 'src/interface/interfaces';
import { UserService } from './user.service';
import { BasicUserInforDto, UpdateUserDto } from './dtos/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('/')
  getAll() {
    return this.userService.getAll();
  }
  @Roles('BASIC', 'ADMIN')
  @UseGuards(AuthGuard)
  @Get('/me')
  getUserInfor(@VerifiedUser() user: BasicUserInforDto) {
    return { success: false, data: new BasicUserInforDto(user) };
  }
  @Roles('BASIC', 'ADMIN')
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  @UseGuards(AuthGuard)
  @Get('/:id')
  getUserInforById(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.getUserById(id);
  }
  @Roles('BASIC', 'ADMIN')
  @UseGuards(AuthGuard)
  @Patch('/')
  @UseInterceptors(FileInterceptor('userImage'))
  updateUserInfor(
    @GetUserInformation() newUserInfor: UpdateUserDto,
    @VerifiedUser() user: BasicUserInforDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 300000 }), //3MB
          new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
        fileIsRequired: false,
      }),
    )
    avatar: Express.Multer.File,
  ) {
    return this.userService.updateUserInfor(
      user,
      newUserInfor,
      avatar && avatar.buffer,
    );
  }
}
