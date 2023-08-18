import { Injectable } from '@nestjs/common';
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
}
