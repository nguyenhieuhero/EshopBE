import { HttpException, Injectable } from '@nestjs/common';
import { firebasePath } from 'src/enum/enum';
import { GoogleCloudService } from 'src/googlecloud/googlecloud.service';
import {
  CreateProductParams,
  PaginationParams,
  QueryProductParams,
  UpdateProductParams,
} from 'src/interface/interfaces';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseProductDto } from './dtos/product.dto';

const productBasicField = {
  id: true,
  name: true,
  description: true,
  inventory: {
    select: { quantity: true, price: true },
  },
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
    {
      name,
      price,
      description,
      quantity,
      categories,
      import_price,
    }: CreateProductParams,
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
    try {
      const url = await this.googleCloudService.upload(
        productImage.buffer,
        firebasePath.PRODUCT,
      );
      const product = await this.prismaService.product.create({
        data: {
          name,
          description,
          image_url: url,
          inventory: {
            create: {
              import_price,
              price,
              quantity,
            },
          },
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
        data: new ResponseProductDto(product),
        meatadata: { message: 'Product create successfully' },
      };
    } catch (error) {
      console.log(error);
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
        data: products.map((product) => new ResponseProductDto(product)),
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
    return { success: true, data: new ResponseProductDto(product) };
  }

  async updateProductById(
    id: string,
    productInformation: UpdateProductParams,
    productImage: Buffer,
  ) {
    const isNameExist = productInformation.name
      ? await this.prismaService.product.findUnique({
          where: { name: productInformation.name },
        })
      : undefined;
    if (isNameExist && isNameExist.id !== id) {
      throw new HttpException(
        {
          success: false,
          metadata: { message: 'Product name exist!' },
        },
        400,
      );
    }
    const product = await this.prismaService.product.update({
      where: { id },
      data: {
        ...(productInformation.name && { name: productInformation.name }),
        ...(productInformation.description && {
          description: productInformation.description,
        }),
        ...(productImage && {
          image_url: await this.googleCloudService.upload(
            productImage,
            firebasePath.PRODUCT,
          ),
        }),
        ...(productInformation.categories && {
          categories: {
            set: [],
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
    // if (productImage) {
    //   await this.googleCloudService.delete(product.image_url);
    // }
    return {
      success: true,
      data: new ResponseProductDto(product),
      metadata: { message: 'Product update successfully' },
    };
  }
}
