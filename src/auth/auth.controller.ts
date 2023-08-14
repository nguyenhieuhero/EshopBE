import { Controller, Post, Body, Req, Res } from '@nestjs/common';
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
  async signin(@Body() body: SignInDto, @Res() res: Response) {
    return this.authService.signin(body, res);
  }
  @Post('/logout')
  async logout(@Res() res: Response) {
    res.clearCookie('RefreshToken');
    res.send({ success: true, metadata: { message: 'Log out successful' } });
  }

  @Post('/refreshtoken')
  async getToken(@Req() req: Request, @Res() res: Response) {
    return this.authService.refreshToken(req, res);
  }
}
