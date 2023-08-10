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
import { GetProduct } from './decorator/product.decorator';

@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}
  @Roles('ADMIN')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('productImage'))
  @Post('/')
  createProduct(
    @GetProduct() productInformation: CreateProductDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 900000 }), //9MB
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
    @GetProduct() productInformation: CreateProductDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 900000 }), //9MB
          new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
      }),
    )
    productImage: Express.Multer.File,
  ) {}

  @Get('/')
  getAllProduct(
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('name') _name?: string,
    @Query('categoryIds') categoryIds?: string,
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
    return this.productService.getProduct(productFilter, categoryIds);
  }

  @Get('/:id')
  getProductById(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.getProductById(id);
  }
}
