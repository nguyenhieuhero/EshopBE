import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateCategoryParams,
  PaginationParams,
} from 'src/interface/interfaces';
import { GoogleCloudService } from 'src/googlecloud/googlecloud.service';
import { firebasePath } from 'src/enum/enum';

const categoryBasicField = {
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
      throw new HttpException(
        {
          success: false,
          metadata: { message: 'Category is already existed!' },
        },
        400,
      );
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
  async getAllCategories(
    categorySearchFilter: { label?: { contains?: string } },
    pagination: PaginationParams,
  ) {
    const [categories, count] = await Promise.all([
      this.prismaService.category.findMany({
        select: categoryBasicField,
        ...pagination,
        where: categorySearchFilter,
      }),
      this.prismaService.category.count({ where: categorySearchFilter }),
    ]);

    return {
      success: true,
      data: categories,
      metatdata: { ...pagination, count },
    };
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
      throw new HttpException(
        {
          success: false,
          metadata: { message: 'Not Found!' },
        },
        400,
      );
    }
    if (categoryInformation.label) {
      const isLabelExist = await this.prismaService.category.findUnique({
        where: { label: categoryInformation.label },
      });
      if (isLabelExist && isLabelExist.id !== category.id) {
        throw new HttpException(
          {
            success: false,
            metadata: { message: 'Label already Exist!' },
          },
          400,
        );
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
      select: categoryBasicField,
    });
    if (categoryImage) {
      await this.googleCloudService.delete(category.image_url);
    }
    return {
      success: true,
      data: _category,
      metadata: { message: 'Update successfully!' },
    };
  }
}
