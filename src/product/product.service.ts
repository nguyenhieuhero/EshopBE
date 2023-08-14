import { HttpException, Injectable } from '@nestjs/common';
import { firebasePath } from 'src/enum/enum';
import { GoogleCloudService } from 'src/googlecloud/googlecloud.service';
import {
  CreateProductParams,
  PaginationParams,
  QueryProductParams,
} from 'src/interface/interfaces';
import { PrismaService } from 'src/prisma/prisma.service';

const productBasicField = {
  id: true,
  name: true,
  price: true,
  description: true,
  quantity: true,
  image_url: true,
  categories: {
    select: { id: true, label: true },
  },
};

@Injectable()
export class ProductService {
  constructor(
    private prismaService: PrismaService,
    private googleCloudService: GoogleCloudService,
  ) {}
  async categoryIdValidate(target: number[]) {
    const categoryIds = await this.prismaService.category
      .findMany({
        select: { id: true },
      })
      .then((validCategories) => validCategories.map((field) => field.id));
    if (target.every((id) => categoryIds.includes(id))) {
      return target;
    }
    throw new HttpException('Invalid Category!', 400);
  }

  async createProduct(
    { name, price, description, quantity, categories }: CreateProductParams,
    productImage: Express.Multer.File,
  ) {
    const validCategoryIds = await this.categoryIdValidate(categories);
    const isExist = await this.prismaService.product.findUnique({
      where: { name },
    });
    if (isExist) {
      return { success: false, metadata: { message: 'Product name exist!' } };
    }
    const url = await this.googleCloudService.upload(
      productImage.buffer,
      firebasePath.PRODUCT,
    );
    try {
      const product = await this.prismaService.product.create({
        data: {
          name,
          price,
          description,
          quantity,
          image_url: url,
          categories: {
            connect: validCategoryIds.map((categoryId) => {
              return { id: categoryId };
            }),
          },
        },
      });
      return { success: true };
    } catch (error) {
      return { success: false, metadata: { message: error.message } };
    }
  }

  async getProduct(
    productFilter: QueryProductParams,
    pagination: PaginationParams,
    categoryIds: string,
  ) {
    try {
      const filter = {
        ...productFilter,
        ...(categoryIds && {
          categories: {
            some: {
              id: {
                in: await this.categoryIdValidate(
                  categoryIds
                    .split(',')
                    .map((categoryId) => Number.parseInt(categoryId)),
                ),
              },
            },
          },
        }),
      };
      const [products, count] = await Promise.all([
        this.prismaService.product.findMany({
          select: productBasicField,
          ...pagination,
          where: filter,
        }),
        this.prismaService.product.count({ where: filter }),
      ]);
      return {
        success: true,
        data: products,
        metadata: { ...pagination, count },
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        metadata: { message: error.message },
      };
    }
  }

  async getProductById(id: string) {
    const product = await this.prismaService.product.findUnique({
      where: { id },
      select: productBasicField,
    });
    if (!product) {
      return { success: false, metadata: { message: 'Not Found!' } };
    }
    return { success: true, data: product };
  }

  async updateProductById(
    id: string,
    productInformation: Partial<CreateProductParams>,
    productImage: Buffer,
  ) {
    const product = await this.prismaService.product.findUnique({
      where: { id },
      select: productBasicField,
    });
    if (!product) {
      return { success: false, metadata: { message: 'Not Found!' } };
    }

    if (productImage) {
      await this.googleCloudService.delete(product.image_url);
    }
    await this.prismaService.product.update({
      where: { id },
      data: {
        ...(productInformation.name && { name: productInformation.name }),
        ...(productInformation.price && { price: productInformation.price }),
        ...(productInformation.description && {
          description: productInformation.description,
        }),
        ...(productInformation.quantity && {
          quantity: productInformation.quantity,
        }),
        ...(productImage && {
          image_url: await this.googleCloudService.upload(
            productImage,
            firebasePath.PRODUCT,
          ),
        }),
        ...(productInformation.categories && {
          categories: {
            disconnect: product.categories.map((field) => {
              return { id: field.id };
            }),
            connect: await this.categoryIdValidate(
              productInformation.categories,
            ).then((validCategories) =>
              validCategories.map((category) => ({ id: category })),
            ),
          },
        }),
      },
    });
    return { success: true };
  }
}
