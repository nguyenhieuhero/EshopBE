import { Exclude, Expose } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsDecimal,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
  IsNumber,
  IsUUID,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  import_price: number;

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

export class ResponseProductDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Exclude()
  inventory: {
    quantity: number;
    price: number;
  };

  @Expose()
  get quantity(): number {
    return this.inventory.quantity;
  }

  @Expose()
  get price(): number {
    return this.inventory.price;
  }

  @IsString()
  @IsNotEmpty()
  image_url: string;

  @IsArray()
  categories: {
    id: number;
    label: string;
  }[];
  constructor(partial: Partial<ResponseProductDto>) {
    Object.assign(this, partial);
  }
}
