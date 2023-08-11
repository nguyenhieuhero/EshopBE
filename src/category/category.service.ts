import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryParams } from 'src/interface/interfaces';
import { GoogleCloudService } from 'src/googlecloud/googlecloud.service';
import { firebasePath } from 'src/enum/enum';
@Injectable()
export class CategoryService {
  constructor(
    private prismaService: PrismaService,
    private googleCloudService: GoogleCloudService,
  ) {}
  async createCategory(category: CreateCategoryParams, categoryImage: Buffer) {
    const isExist = await this.prismaService.category.findFirst({
      where: { label: category.label },
    });
    if (isExist) {
      throw new HttpException('Category is already existed!', 400);
    }
    const url = await this.googleCloudService.upload(
      categoryImage,
      firebasePath.CATEGORY,
    );
    await this.prismaService.category.create({
      data: { ...category, image_url: url },
    });
    return { message: 'Create category success!' };
  }
  async getAllCategories() {
    return await this.prismaService.category.findMany({
      select: { id: true, label: true, description: true, image_url: true },
    });
  }

  async updateCategoryById(
    id: number,
    categoryInformation: Partial<CreateCategoryParams>,
    categoryImage: Buffer,
  ) {
    const category = await this.prismaService.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new HttpException('Not Found!', 404);
    }
    //check unique label
    if (categoryInformation.label) {
      const isLabelExist = await this.prismaService.category.findUnique({
        where: { label: categoryInformation.label },
      });
      if (isLabelExist && isLabelExist.id !== category.id) {
        throw new HttpException('Label already Exist', 400);
      }
    }
    await this.prismaService.category.update({
      where: { id },
      data: {
        ...(categoryInformation.label && { label: categoryInformation.label }),
        ...(categoryInformation.description && {
          description: categoryInformation.description,
        }),
        ...(categoryImage && {
          image_url: await this.googleCloudService.upload(
            categoryImage,
            firebasePath.CATEGORY,
          ),
        }),
      },
    });
    if (categoryImage) {
      await this.googleCloudService.delete(category.image_url);
    }
    return { message: 'Update successfully!' };
  }
}
