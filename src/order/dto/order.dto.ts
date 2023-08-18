// import { Role } from '.prisma/client'
import { Exclude, Expose,Type} from 'class-transformer'

import {
   IsNumber,
   IsPositive,
   IsString,
   IsNotEmpty,
   IsOptional,
   IsEnum,
   ValidateNested,
   IsArray,
   IsUUID,
   
} from "class-validator"

export class OrderDto {

   id  :        string;
   user_id:     string;
   payment_id : string
   total     :  number
   is_success : Boolean

   constructor(partial: Partial<OrderDto> ){
      Object.assign(this,partial);
  }
}


export class CreateOrderDto {
  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  @IsNotEmpty()
  @IsArray()
  orderItems: CreateOrderItemDto[];
}


export class CreateOrderItemDto {


  @IsNotEmpty()
  @IsUUID()
  user_id: string;


  @IsUUID()
  @IsNotEmpty()
  @IsOptional()
  payment_id?: string;

  @IsUUID()
  @IsNotEmpty()
  product_id: string;

  @IsNotEmpty()
  quantity: number;

//   @IsNotEmpty()
  is_success: boolean;
}



export class UpdateOrderItemDto {

  @IsNotEmpty()
  order_id: string;

  @IsNotEmpty()
  product_id: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}

export class DeleteOrderItemDto {

  @IsNotEmpty()
  order_id: string;

  @IsNotEmpty()
  product_id: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}


