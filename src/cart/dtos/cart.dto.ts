import { Inject, UseGuards } from '@nestjs/common';
import { Exclude, Expose, Type } from 'class-transformer';
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
  IsOptional,
  MinLength,
} from 'class-validator';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductIdParamGuard } from 'src/product/guard/product.guard';
export class ResponseCartItemDto {
  @IsInt()
  @IsNotEmpty()
  quantity: number;

  @Exclude()
  product: {
    id: string;
    name: string;
    description: string;
    image_url: string;
    categories: {
      id: number;
      label: string;
    }[];
    inventory: {
      price: number;
    };
  };
  @Expose()
  get id() {
    return this.product.id;
  }
  @Expose()
  get name() {
    return this.product.name;
  }

  @Expose()
  get description() {
    return this.product.description;
  }

  @Expose()
  get image_url() {
    return this.product.image_url;
  }

  @Expose()
  get categories() {
    return this.product.categories;
  }

  @Expose()
  get pricePerUnit() {
    return this.product.inventory.price;
  }

  constructor(partial: Partial<ResponseCartItemDto>) {
    return Object.assign(this, partial);
  }
}

class SingleProductCheckoutDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsInt()
  @IsNotEmpty()
  quantity: number;
}

export class ProductCheckoutDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SingleProductCheckoutDto)
  products: SingleProductCheckoutDto[];
}
