import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Roles('ADMIN', 'BASIC')
  @UseGuards(AuthGuard)
  @Get()
  getAllInventory() {
    return this.inventoryService.getAllInventory();
  }
}
