import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseArrayPipe,
  ParseFilePipe,
  ParseFloatPipe,
  Post,
  Patch,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { CreateProductDto, UpdateProductDto } from './dtos/product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetProductInformation } from './decorator/product.decorator';
import { ProductIdParamGuard } from './guard/product.guard';

@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}
  @Roles('ADMIN')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('productImage'))
  @Post('/')
  createProduct(
    @GetProductInformation() productInformation: CreateProductDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 600000 }), //6MB
          new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
      }),
    )
    productImage: Express.Multer.File,
  ) {
    return this.productService.createProduct(productInformation, productImage);
  }

  @Roles('ADMIN')
  @UseGuards(AuthGuard)
  @UseGuards(ProductIdParamGuard)
  @UseInterceptors(FileInterceptor('productImage'))
  @Patch('/:productId')
  updateProduct(
    @Param('productId') id: string,
    @GetProductInformation()
    productInformation: UpdateProductDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 600000 }), //6MB
          new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
        fileIsRequired: false,
      }),
    )
    productImage: Express.Multer.File,
  ) {
    return this.productService.updateProductById(
      id,
      productInformation,
      productImage && productImage.buffer,
    );
  }

  @Get('/')
  getAllProduct(
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('name') _name?: string,
    @Query('categoryIds') categoryIds?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const price =
      minPrice || maxPrice
        ? {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) }),
          }
        : undefined;
    const productFilter = {
      ...(price && { price }),
      ...(_name && { name: { contains: _name } }),
    };
    const _take = limit ? parseInt(limit) : 9;
    const _pageIndex = parseInt(page) >= 1 ? parseInt(page) - 1 : 0;
    const pagination = {
      take: _take,
      skip: _pageIndex * _take,
    };
    return this.productService.getProduct(
      productFilter,
      pagination,
      categoryIds,
    );
  }
  @UseGuards(ProductIdParamGuard)
  @Get('/:productId')
  getProductById(@Param('productId') id: string) {
    return this.productService.getProductById(id);
  }
}
