import {
  IsNotEmpty,
  IsString,
  IsDecimal,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';

class CategoryId {
  @IsInt()
  @IsNotEmpty()
  id: number;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  quantity: number;

  @IsNumber({}, { each: true })
  categories: number[];
}
