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
      success: true,
      AccessToken: token.accessToken,
    });
  }
  @Post('/refreshtoken')
  async getToken(@Req() req: Request, @Res() res: Response) {
    const newToken = await this.authService.refreshToken(req);
    if (newToken) {
      res.header('Authorization', 'Bearer ' + newToken.newAccessToken);
      res.cookie('RefreshToken', newToken.newRefreshToken, {
        httpOnly: true,
      });
      res.send({
        success: true,
        AccessToken: newToken.newAccessToken,
      });
    }
    res.send({ success: false });
  }
}
