import { Injectable } from '@nestjs/common';
import { UpdateInventoryParams } from 'src/interface/interfaces';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prismaService: PrismaService) {}
  async getAllInventory() {
    const inventories = await this.prismaService.inventory.findMany();
    return {
      success: true,
      data: inventories,
    };
  }
  async updateInventory(product_id: string, inventory: UpdateInventoryParams) {
    const _inventory = await this.prismaService.inventory.update({
      where: { product_id },
      data: inventory,
    });
    return {
      success: true,
      data: _inventory,
      metadata: { message: 'Update inventory successfully!' },
    };
  }

  async exportFromInventory(product_id: string, quantity: number) {
    const _inventory = await this.prismaService.inventory.findUnique({
      where: { product_id },
    });
    if (_inventory.quantity < quantity) {
      throw new Error('Not enough product');
    }
    await this.prismaService.inventory.update({
      where: { product_id },
      data: {
        quantity: { decrement: quantity },
        revenue: { increment: quantity * _inventory.price },
        profit: {
          increment: quantity * (_inventory.price - _inventory.import_price),
        },
      },
    });
  }
}
