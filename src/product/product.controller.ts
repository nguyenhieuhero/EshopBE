import {
  Body,
  Controller,
  Get,
  ParseArrayPipe,
  ParseFloatPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { CreateProductDto } from './dtos/product.dto';

@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}
  @Roles('ADMIN')
  @UseGuards(AuthGuard)
  @Post('/')
  createProduct(@Body() product: CreateProductDto) {
    return this.productService.createProduct(product);
  }

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
}
