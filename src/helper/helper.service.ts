import { HttpException, Injectable, Scope } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { JWTPayloadParams } from 'src/interface/interfaces';
interface Tokenable {
  [key: string]: string;
}

const AT_EXPIRED_TIME = '1h';
const RT_EXPIRED_TIME = '7d';

@Injectable({ scope: Scope.REQUEST })
export class HelperService {
  hash(value: string): Promise<string> {
    return bcrypt.hash(value, 8);
  }
  hashCompare(value: string, hashedTarget: string): Promise<Boolean> {
    return bcrypt.compare(value, hashedTarget);
  }
  createAcessToken(obj: Tokenable) {
    return jwt.sign(obj, process.env.JWT_AT_SECRET, {
      expiresIn: AT_EXPIRED_TIME,
    });
  }
  verifyAccessToken(token: string) {
    return jwt.verify(token, process.env.JWT_AT_SECRET);
  }
  createRefreshToken(obj: Tokenable) {
    return jwt.sign(obj, process.env.JWT_RT_SECRET, {
      expiresIn: RT_EXPIRED_TIME,
    });
  }
  verifyRefeshToken(token: string) {
    return jwt.verify(token, process.env.JWT_RT_SECRET);
  }
  refreshToken(token: string) {
    try {
      const { id, role, name, exp } = this.verifyRefeshToken(
        token,
      ) as JWTPayloadParams;
      const currentTime = new Date().getTime();
      const refreshToken = jwt.sign(
        { id, role, name },
        process.env.JWT_RT_SECRET,
        {
          expiresIn: `${exp * 1000 - currentTime}ms`,
        },
      );
      return refreshToken;
    } catch (error) {
      throw new HttpException('Invalid Token', 400);
    }
  }
  decode(token: string): string | jwt.JwtPayload {
    return jwt.decode(token);
  }
  logger() {
    console.log('ok!');
  }
}
