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
import { CreateProductDto } from './dtos/product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetProductInformation } from './decorator/product.decorator';

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
  @UseInterceptors(FileInterceptor('productImage'))
  @Patch('/:id')
  updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @GetProductInformation()
    productInformation: Partial<CreateProductDto>,
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
    const _take = limit ? parseInt(limit) : 5;
    const _skip = parseInt(page) >= 1 ? parseInt(page) - 1 : 0;
    const pagination = {
      take: _take,
      skip: _skip * _take,
    };
    return this.productService.getProduct(
      productFilter,
      pagination,
      categoryIds,
    );
  }

  @Get('/:id')
  getProductById(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.getProductById(id);
  }
}
