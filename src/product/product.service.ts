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
    throw new HttpException(
      { success: false, metadata: { message: 'Invalid Category!' } },
      400,
    );
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
      throw new HttpException(
        {
          success: false,
          metadata: { message: 'Product name exist!' },
        },
        400,
      );
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
        select: productBasicField,
      });
      return {
        success: true,
        data: product,
        meatadata: { message: 'Product create successfully' },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          metadata: { message: error.message },
        },
        400,
      );
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
      throw new HttpException(
        {
          success: false,
          data: [],
          metadata: { message: error.message },
        },
        400,
      );
    }
  }

  async getProductById(id: string) {
    const product = await this.prismaService.product.findUnique({
      where: { id },
      select: productBasicField,
    });
    if (!product) {
      throw new HttpException(
        {
          success: false,
          metadata: { message: 'Not Found!' },
        },
        404,
      );
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
      throw new HttpException(
        {
          success: false,
          metadata: { message: 'Not Found!' },
        },
        404,
      );
    }

    const _product = await this.prismaService.product.update({
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
      select: productBasicField,
    });
    if (productImage) {
      await this.googleCloudService.delete(product.image_url);
    }
    return {
      success: true,
      data: _product,
      metadata: { message: 'Product update successfully' },
    };
  }
}
