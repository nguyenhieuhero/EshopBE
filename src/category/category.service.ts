import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryParams } from 'src/interface/interfaces';
import { GoogleCloudService } from 'src/googlecloud/googlecloud.service';
import { firebasePath } from 'src/enum/enum';

const basicCategoryField = {
  id: true,
  label: true,
  description: true,
  image_url: true,
};
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
      return {
        success: false,
        metadata: { message: 'Category is already existed!' },
      };
    }
    const url = await this.googleCloudService.upload(
      categoryImage,
      firebasePath.CATEGORY,
    );
    await this.prismaService.category.create({
      data: { ...category, image_url: url },
    });
    return {
      success: true,
      metadata: { message: 'Create category success!' },
    };
  }
  async getAllCategories() {
    const categories = await this.prismaService.category.findMany({
      select: basicCategoryField,
    });

    return { success: true, data: categories };
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
      return { success: false, metada: { message: 'Not Found!' } };
    }
    if (categoryInformation.label) {
      const isLabelExist = await this.prismaService.category.findUnique({
        where: { label: categoryInformation.label },
      });
      if (isLabelExist && isLabelExist.id !== category.id) {
        return { success: false, metada: { message: 'Label already Exist!' } };
      }
    }
    const _category = await this.prismaService.category.update({
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
      select: basicCategoryField,
    });
    if (categoryImage) {
      await this.googleCloudService.delete(category.image_url);
    }
    return {
      success: true,
      data: _category,
      metada: { message: 'Update successfully!' },
    };
  }
}
