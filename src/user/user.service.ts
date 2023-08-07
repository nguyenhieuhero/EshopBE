import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { HelperService } from 'src/helper/helper.service';
import {
  BasicUserInforParams,
  JWTPayloadParams,
  UpdateUserParams,
  VerifiedUserParams,
} from 'src/interface/interfaces';
import { PrismaService } from 'src/prisma/prisma.service';

const userBasicField = {
  id: true,
  email: true,
  fullname: true,
  address: true,
  phone: true,
  role: true,
  image_url: true,
};

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private helper: HelperService,
  ) {}
  async getUserById(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: userBasicField,
    });
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }
  async updateUserInfor(
    user: VerifiedUserParams,
    { fullname, address, phone, password }: UpdateUserParams,
  ) {
    if (phone && phone !== user.phone) {
      const isPhoneExist = await this.prismaService.user.findUnique({
        where: { phone },
      });
      if (isPhoneExist) {
        throw new HttpException('Phone number existed', 400);
      }
    }
    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        ...(fullname && { fullname }),
        ...(address && { address }),
        ...(phone && { phone }),
        ...(password && { password: await this.helper.hash(password) }),
      },
    });
    return { success: true };
  }
}
