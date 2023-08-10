import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Res,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { SignInDto, SignUpDto } from './dtos/auth.dto';
import { AuthService } from './auth.service';
import { Roles } from './decorator/roles.decorator';
import { VerifiedUser } from 'src/user/decorator/user.decorator';
import { AuthGuard } from './guard/auth.guard';
import { JWTPayloadParams } from '../interface/interfaces';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('/signup')
  async signup(@Body() body: SignUpDto) {
    return await this.authService.signup(body);
  }
  @Post('/signin')
  async signin(
    @Body() body: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.authService.signin(body);
    res.header('Authorization', 'Bearer ' + token.accessToken);
    res.cookie('RefreshToken', token.refreshToken, {
      httpOnly: true,
    });
    res.send({
      AccessToken: token.accessToken,
    });
  }
  @Post('/refreshtoken')
  async getToken(@Req() req: Request, @Res() res: Response) {
    const newToken = await this.authService.refreshToken(req);
    if (newToken) {
      res.set('Authorization', 'Bearer ' + newToken.newAccessToken);
      res.cookie('RefreshToken', newToken.newRefreshToken, {
        httpOnly: true,
      });
      res.send({
        success: true,
      });
    }
    res.send({ success: false });
  }
}
