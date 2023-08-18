
import { Controller ,Get, Post, Put, Delete,Query ,ParseIntPipe,Param,Body} from '@nestjs/common';
import { OrderService} from './order.service';
import { get } from 'http';
// import { ROLE } from '@prisma/client';
import { OrderDto } from './dto/order.dto';
import { CreateOrderItemDto ,UpdateOrderItemDto,DeleteOrderItemDto} from './dto/order.dto';



@Controller('order')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    // @Get() 
    // getOrderItem() :Promise<OrderDto []>{
    //     return this.orderService.getOrderItem();
    // }

    @Post()
    addToCart(@Body() body: CreateOrderItemDto) {
        return this.orderService.addToCart(body);
    }

    @Delete() 
    deleteOrderItem(@Body() body: {id: string}) {
        return this.orderService.deleteOrderItem(body.id)
    }

    @Get("")
    calculateOrderDetailForUser(@Body() body: {user_id: string}) {
        return this.orderService.calculateOrderDetailForUser(body.user_id)
    }

    @Get("user")
    calculateOrderForUser(@Body() body: {user_id: string}) {
        return this. orderService.calculateOrderForUser(body.user_id)
    }


    @Post('cart')
    toggleProductSelection(@Body() body: {orderItemId: string} ) {
        return this.orderService.toggleProductSelection(body.orderItemId)
    }

    @Put('cart')
    updateOrderItemsStatus() {
        return this.orderService.updateOrderItemsStatus();
    }

}
