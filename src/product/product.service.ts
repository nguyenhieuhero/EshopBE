import { HttpException, Injectable } from '@nestjs/common';
import { firebasePath } from 'src/enum/enum';
import { GoogleCloudService } from 'src/googlecloud/googlecloud.service';
import {
  CreateProductParams,
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
      throw new HttpException('Product name exist', 400);
    }
    const url = await this.googleCloudService.upload(
      productImage.buffer,
      firebasePath.PRODUCT,
    );
    const product = await this.prismaService.product.create({
      data: {
        name,
        price,
        description,
        quantity,
        image_url: url,
      },
    });
    try {
      await this.prismaService.categoryProduct.createMany({
        data: validCategoryIds.map((categoryId) => {
          return { product_id: product.id, category_id: categoryId };
        }),
      });
      return { success: true };
    } catch (error) {
      return { success: false, message: 'some thing wrong!!' };
    }
  }

  async getProduct(productFilter: QueryProductParams, categoryIds: string) {
    try {
      let productIdsArray: string[];
      if (categoryIds) {
        const _categoryIds = categoryIds
          .split(',')
          .map((categoryId) => Number.parseInt(categoryId));
        const validCategoryIds = await this.categoryIdValidate(_categoryIds);
        const categoryProducts =
          await this.prismaService.categoryProduct.findMany({
            where: { category_id: { in: validCategoryIds } },
            select: { product_id: true },
          });
        productIdsArray = categoryProducts.map((e) => e.product_id);
      }

      const products = await this.prismaService.product.findMany({
        select: productBasicField,
        where: {
          ...productFilter,
          ...(productIdsArray && { id: { in: productIdsArray } }),
        },
      });
      return products;
    } catch (error) {
      return [];
    }
  }

  async getProductById(id: string) {
    const product = await this.prismaService.product.findUnique({
      where: { id },
      select: productBasicField,
    });
    if (!product) {
      return new HttpException('Not Found', 404);
    }
    return product;
  }

  async updateProductById(
    id: string,
    productInformation: Partial<CreateProductParams>,
    productImage: Buffer,
  ) {
    const product = await this.prismaService.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new HttpException('Not Found!', 404);
    }
    if (productInformation.categories) {
      const validCategoryIds = await this.categoryIdValidate(
        productInformation.categories,
      );
      await this.prismaService.categoryProduct.deleteMany({
        where: { product_id: product.id },
      });
      await this.prismaService.categoryProduct.createMany({
        data: validCategoryIds.map((categoryId) => {
          return { product_id: product.id, category_id: categoryId };
        }),
      });
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
      },
    });
    return { message: 'Cập nhật thành công!' };
  }
}
