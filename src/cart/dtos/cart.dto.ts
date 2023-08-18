import { Optional } from '@nestjs/common';
import { IsInt, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CartItemDto {
  @IsUUID()
  @IsNotEmpty()
  product_id: string;

  @IsOptional()
  @IsInt()
  @IsNotEmpty()
  quantity: number = 1;
}
