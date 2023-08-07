import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { CreateCategoryDto } from './dtos/category.dto';
import { CategoryService } from './category.service';

@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}
  @Roles('ADMIN')
  @UseGuards(AuthGuard)
  @Post()
  async createCategory(@Body() category: CreateCategoryDto) {
    return this.categoryService.createCategory(category);
  }
}
