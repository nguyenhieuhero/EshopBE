import { Injectable, NotFoundException } from '@nestjs/common';
import { JWTPayloadParams } from 'src/interface/interfaces';
import { PrismaService } from 'src/prisma/prisma.service';

const userBasicField = {
  id: true,
  email: true,
  fullname: true,
  address: true,
  phone: true,
  role: true,
};

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}
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
}
