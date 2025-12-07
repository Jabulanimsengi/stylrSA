import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { Top10RequestsService } from './top10-requests.service';
import { CreateTop10RequestDto } from './dto/create-top10-request.dto';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/guard/roles.decorator';

@Controller('api/top10-requests')
export class Top10RequestsController {
  constructor(private readonly top10RequestsService: Top10RequestsService) {}

  @Post()
  async createRequest(@Body() dto: CreateTop10RequestDto) {
    return this.top10RequestsService.createRequest(dto);
  }

  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  async getAllRequests(@Query('status') status?: string) {
    return this.top10RequestsService.getAllRequests(status);
  }

  @Patch(':id/status')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.top10RequestsService.updateRequestStatus(id, status);
  }
}
