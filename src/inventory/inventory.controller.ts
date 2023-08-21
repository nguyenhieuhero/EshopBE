import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { InventoryService } from './inventory.service';
import { ProductIdParamGuard } from 'src/product/guard/product.guard';
import { UpdateInventoryDto } from './dtos/inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Roles('ADMIN')
  @UseGuards(AuthGuard)
  @Get()
  getAllInventory() {
    return this.inventoryService.getAllInventories();
  }

  @Roles('ADMIN')
  @UseGuards(AuthGuard)
  @UseGuards(ProductIdParamGuard)
  @Get('/:productId')
  getInventoryById(@Param('productId') productId: string) {
    return this.inventoryService.getInventoryById(productId);
  }

  @Roles('ADMIN')
  @UseGuards(AuthGuard)
  @UseGuards(ProductIdParamGuard)
  @Patch('/:productId')
  updateInventoryById(
    @Param('productId') productId: string,
    @Body() inventory: UpdateInventoryDto,
  ) {
    return this.inventoryService.updateInventory(productId, inventory);
  }
}
