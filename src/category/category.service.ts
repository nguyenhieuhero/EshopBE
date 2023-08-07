import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryParams } from 'src/interface/interfaces';
@Injectable()
export class CategoryService {
  constructor(private prismaService: PrismaService) {}
  async createCategory(category: CreateCategoryParams) {
    const isExist = await this.prismaService.category.findFirst({
      where: { label: category.label },
    });
    if (isExist) {
      throw new HttpException('Category is already existed!', 400);
    }
    await this.prismaService.category.create({ data: category });
    return { message: 'Create category success!' };
  }
}
