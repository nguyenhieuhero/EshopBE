import { IsNotEmpty, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  image_url: string;
}
