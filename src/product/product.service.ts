import { HttpException, Injectable } from '@nestjs/common';
import {
  CreateProductParams,
  QueryProductParams,
} from 'src/interface/interfaces';
import { PrismaService } from 'src/prisma/prisma.service';

const productBasicField = {
  name: true,
  price: true,
  description: true,
  quantity: true,
  image_url: true,
};

@Injectable()
export class ProductService {
  constructor(private prismaService: PrismaService) {}
  async createProduct({
    name,
    price,
    description,
    quantity,
    image_url,
    categories,
  }: CreateProductParams) {
    const isExist = await this.prismaService.product.findUnique({
      where: { name },
    });
    if (isExist) {
      throw new HttpException('Product name exist', 400);
    }
    const product = await this.prismaService.product.create({
      data: {
        name,
        price,
        description,
        quantity,
        image_url,
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
      const _categoryIds = categoryIds
        .split(',')
        .map((categoryId) => Number.parseInt(categoryId));
      const categoryProducts =
        await this.prismaService.categoryProduct.findMany({
          where: { category_id: { in: _categoryIds } },
          select: { product_id: true },
        });
      const productIdsArray = categoryProducts.map((e) => e.product_id);
      const products = await this.prismaService.product.findMany({
        select: productBasicField,
        where: { ...productFilter, id: { in: productIdsArray } },
      });
      return products;
    } catch (error) {
      return [];
    }
  }
}
