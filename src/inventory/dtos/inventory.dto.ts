import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateInventoryDto {
  @IsOptional()
  @IsInt()
  @IsNotEmpty()
  price: number;

  @IsOptional()
  @IsInt()
  @IsNotEmpty()
  import_price: number;

  @IsOptional()
  @IsInt()
  @IsNotEmpty()
  quantity: number;
}
