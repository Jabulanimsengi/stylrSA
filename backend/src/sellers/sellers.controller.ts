import { Controller, Get, Param } from '@nestjs/common';
import { SellersService } from './sellers.service';

@Controller('api/sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sellersService.findById(id);
  }
}
