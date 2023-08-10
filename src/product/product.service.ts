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
    private googleCloundService: GoogleCloudService,
  ) {}
  async createProduct(
    { name, price, description, quantity, categories }: CreateProductParams,
    productImage: Express.Multer.File,
  ) {
    const isExist = await this.prismaService.product.findUnique({
      where: { name },
    });
    if (isExist) {
      throw new HttpException('Product name exist', 400);
    }
    const url = await this.googleCloundService.upload(
      productImage,
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
    //Check if category id exist
    const _categories = await this.prismaService.category.findMany({
      where: { id: { in: categories } },
    });
    try {
      await this.prismaService.categoryProduct.createMany({
        data: _categories.map((category) => {
          return { product_id: product.id, category_id: category.id };
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
        const categoryProducts =
          await this.prismaService.categoryProduct.findMany({
            where: { category_id: { in: _categoryIds } },
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
      return null;
    }
    return product;
  }
}
