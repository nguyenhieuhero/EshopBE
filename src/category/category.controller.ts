import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { CreateCategoryDto } from './dtos/category.dto';
import { CategoryService } from './category.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}
  @Roles('ADMIN')
  @UseGuards(AuthGuard)
  @Post()
  createCategory(@Body() category: CreateCategoryDto) {
    return this.categoryService.createCategory(category);
  }
  @Get()
  getAllCategories() {
    return this.categoryService.getAllCategories();
  }
  @Roles('ADMIN')
  @UseGuards(AuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
  }
}
