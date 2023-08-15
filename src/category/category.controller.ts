import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { CreateCategoryDto } from './dtos/category.dto';
import { CategoryService } from './category.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetCategoryInformation } from './decorator/category.decorator';

@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}
  @Roles('ADMIN')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('categoryImage'))
  @Post()
  createCategory(
    @GetCategoryInformation() category: CreateCategoryDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 600000 }), //6MB
          new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
      }),
    )
    categoryImage: Express.Multer.File,
  ) {
    return this.categoryService.createCategory(category, categoryImage.buffer);
  }
  @Get()
  getAllCategories(
    @Query('name') _name?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const categorySearchFilter = {
      ...(_name && { label: { contains: _name } }),
    };
    const _take = limit ? parseInt(limit) : 5;
    const _pageIndex = parseInt(page) >= 1 ? parseInt(page) - 1 : 0;
    const pagination = {
      take: _take,
      skip: _pageIndex * _take,
    };
    return this.categoryService.getAllCategories(
      categorySearchFilter,
      pagination,
    );
  }
  @Roles('ADMIN')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('categoryImage'))
  @Patch('/:id')
  updateCategoryt(
    @Param('id', ParseIntPipe) id: number,
    @GetCategoryInformation()
    categoryInformation: Partial<CreateCategoryDto>,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 600000 }), //6MB
          new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
        fileIsRequired: false,
      }),
    )
    categoryImage: Express.Multer.File,
  ) {
    return this.categoryService.updateCategoryById(
      id,
      categoryInformation,
      categoryImage && categoryImage.buffer,
    );
  }
}
