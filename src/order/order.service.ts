import { Injectable } from '@nestjs/common';
import { OrderDto } from './dto/order.dto';
import { PrismaService} from 'src/prisma/prisma.service'
import { CreateOrderItemDto ,UpdateOrderItemDto,DeleteOrderItemDto} from './dto/order.dto'



@Injectable()
export class OrderService {
    constructor(private prismarService:  PrismaService) {}
    async getOrderItem(): Promise<OrderDto [] > {
        const orderItem = await this.prismarService.orderItem.findMany();
        return  orderItem.map(order => new OrderDto(order))
    }



    async addToCart (createOrderItemDto: CreateOrderItemDto) {

        const orderItem = this.prismarService.orderItem.create({
            data: {
                ...createOrderItemDto,
                is_success: false,
            },
        });

        return orderItem;
    }

    async updateOrderItem (id: string,data:UpdateOrderItemDto) {

        const updateOrderItem = await this.prismarService.orderItem.update({
            where: {
                id,
            },
            data: {
                ...data
            }
        })
        return updateOrderItem;
    }

    async deleteOrderItem(id: string) {
        const orderItem = await this.prismarService.orderItem.delete({
            where: {
                id,
            },
        })

        return orderItem ;
    }

    async calculateOrderDetailForUser(user_id: string) {
        const orderItems = await this.prismarService.orderItem.findMany({
          where: {
            user_id,
          },
          include: {
            product: true,
          },
        });
      

        const orderItemsInfo = orderItems.map(item => ({
            id: item.id,
            product_id: item.product_id,
            quantity: item.quantity,
            product_name: item.product.name,
            product_price: item.product.price,
            product_description: item.product.description,
            total_price: item.quantity * item.product.price,
            image : item.product.image_url
          }));

        const result =  orderItemsInfo ; 
        return  result;
    }   

    
    async calculateOrderForUser(user_id: string) {
        const orderItems = await this.prismarService.orderItem.findMany({
            where: {
              user_id,
              is_success: true,
            },
            include: {
              product: true,
            },
          });

          const orderItemsInfo = orderItems.map(item => ({
            id: item.id,
            product_id: item.product_id,
            quantity: item.quantity,
            product_name: item.product.name,
            product_price: item.product.price,
            product_description: item.product.description,
            total_price: item.quantity * item.product.price,
            image : item.product.image_url
          }));


        const totalPrice = orderItems.reduce((total, orderItem) => {
            return total + orderItem.product.price * orderItem.quantity;
        },0)

        const result = { totalPrice, orderItemsInfo }; 
        return  result;
    }


    private data = [];
    async productPayment(user_id: string) {
      const orderItems = await this.prismarService.orderItem.findMany({
        where: {
          user_id : user_id
        },
        include: {
          product: true,
        },
      
    })

        const orderItemsInfo = orderItems.map(item => ({
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          product_name: item.product.name,
          product_price: item.product.price,
          product_description: item.product.description,
          total_price: item.quantity * item.product.price
          // img nua
        }));


      const totalPrice = orderItems.reduce((total, orderItem) => {
          return total + orderItem.product.price * orderItem.quantity;
      },0)

      const result = { totalPrice, orderItemsInfo }; 
      this.data.push(result);

      return this.data;
      // return result;
    }

  private selectOrderItemId = [];
  private selectedProducts = [];

  async toggleProductSelection(orderItem_id: string) {
    const index = this.selectOrderItemId.indexOf(orderItem_id);

    if (index !== -1) {
        this.selectOrderItemId.splice(index, 1);

        // Xóa phần tử tương ứng trong selectedProducts
        const selectedProductIndex = this.selectedProducts.findIndex(productInfo => productInfo[0]?.id === orderItem_id);
        if (selectedProductIndex !== -1) {
            this.selectedProducts.splice(selectedProductIndex, 1);
        }
    } else {
        this.selectOrderItemId.push(orderItem_id);

        // Kiểm tra xem phần tử đã tồn tại trong selectedProducts chưa
        const existingProductIndex = this.selectedProducts.findIndex(productInfo => productInfo[0]?.id === orderItem_id);
        if (existingProductIndex === -1) {
            const orderItems = await this.prismarService.orderItem.findMany({
                where: {
                    id: orderItem_id,
                },
                include: {
                    product: true,
                },
            });
            const orderItemsInfo = orderItems.map(item => ({
                id: item.id,
                product_id: item.product_id,
                quantity: item.quantity,
                product_name: item.product.name,
                product_price: item.product.price,
                product_description: item.product.description,
                total_price: item.quantity * item.product.price,
                is_success: item.is_success,
                image : item.product.image_url
            }));

            this.selectedProducts.push(orderItemsInfo);
        }

      }
      
      
      const totalSum = this.selectedProducts
      .flat() // Gộp các danh sách sản phẩm thành một mảng duy nhất
      .reduce((sum, product) => sum + product.total_price, 0);

      const result = {selectedProducts:this.selectedProducts.flat(),totalSum}

    return result;
  }

  async updateOrderItemsStatus() {
    const selectedProductsFlat = this.selectedProducts.flat() 
    
    for(const product of selectedProductsFlat) {
      const orderItem = await this.prismarService.orderItem.findUnique({
        where: {
          id: product.id,
        }
      })

      if(orderItem) {
        await this.prismarService.orderItem.update({
          where: {
            id: orderItem.id,
          },
          data: {
            is_success: true,
          }
        })
      }

    }
    this.selectedProducts.length = 0;
    return selectedProductsFlat;
  }

}
    


    



    // người dùng tích thì push vô cái mảng, bỏ tích thì xóa // thanh toán -> sang trang thanh toán bỏ những sản phẩmđã thanh toán ra


      
    // 


      


    






