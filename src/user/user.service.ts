import { Injectable } from '@nestjs/common';
import { GoogleCloudService } from 'src/googlecloud/googlecloud.service';
import { HelperService } from 'src/helper/helper.service';
import { UpdateUserParams, VerifiedUserParams } from 'src/interface/interfaces';
import { PrismaService } from 'src/prisma/prisma.service';
import { firebasePath } from 'src/enum/enum';

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
    private googleCloudService: GoogleCloudService,
  ) {}
  async getUserById(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: userBasicField,
    });
    if (!user) {
      return { success: false, metada: { message: 'Not Found!' } };
    }
    return user;
  }
  async updateUserInfor(
    user: VerifiedUserParams,
    { fullname, address, phone, password }: UpdateUserParams,
    avatar: Buffer,
  ) {
    if (phone && phone !== user.phone) {
      const isPhoneExist = await this.prismaService.user.findUnique({
        where: { phone },
      });
      if (isPhoneExist) {
        return { success: false, metada: { message: 'Phone number existed' } };
      }
    }
    await this.googleCloudService.delete(user.image_url);
    const _user = await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        ...(fullname && { fullname }),
        ...(address && { address }),
        ...(phone && { phone }),
        ...(password && { password: await this.helper.hash(password) }),
        ...(avatar && {
          image_url: await this.googleCloudService.upload(
            avatar,
            firebasePath.USER,
          ),
        }),
      },
      select: userBasicField,
    });

    return { success: true, data: _user };
  }
  async getAll() {
    const users = await this.prismaService.user.findMany({
      select: userBasicField,
    });
    return { success: true, data: users };
  }
}
