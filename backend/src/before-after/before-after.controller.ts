import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Query,
  Req,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { BeforeAfterService } from './before-after.service';

@Controller('api/before-after')
export class BeforeAfterController {
  constructor(private readonly beforeAfterService: BeforeAfterService) {}

  @UseGuards(JwtGuard)
  @Post('upload')
  @UseInterceptors(FilesInterceptor('images', 2)) // Max 2 files: before and after
  async uploadBeforeAfter(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('salonId') salonId: string,
    @Body('serviceId') serviceId: string | undefined,
    @Body('caption') caption: string | undefined,
    @Req() req: any,
  ) {
    if (!files || files.length !== 2) {
      throw new Error('Please upload exactly 2 images (before and after)');
    }

    return this.beforeAfterService.uploadBeforeAfter(
      files,
      salonId,
      serviceId,
      caption,
      req.user.id,
    );
  }

  @Get('approved')
  async getApprovedBeforeAfter(
    @Query('limit') limit?: string,
    @Query('salonId') salonId?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.beforeAfterService.getApprovedBeforeAfter(limitNum, salonId);
  }

  @UseGuards(JwtGuard)
  @Get('my-photos')
  async getMyBeforeAfter(@Req() req: any) {
    return this.beforeAfterService.getBeforeAfterBySalonOwner(req.user.id);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async deleteBeforeAfter(@Param('id') id: string, @Req() req: any) {
    return this.beforeAfterService.deleteBeforeAfter(id, req.user.id);
  }

  // Admin endpoints
  @UseGuards(JwtGuard)
  @Get('pending')
  async getPendingBeforeAfter(@Req() req: any) {
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }
    return this.beforeAfterService.getPendingBeforeAfter();
  }

  @UseGuards(JwtGuard)
  @Patch(':id/approve')
  async approveBeforeAfter(@Param('id') id: string, @Req() req: any) {
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }
    return this.beforeAfterService.approveBeforeAfter(id, req.user.id);
  }

  @UseGuards(JwtGuard)
  @Patch(':id/reject')
  async rejectBeforeAfter(
    @Param('id') id: string,
    @Body('reason') reason: string | undefined,
    @Req() req: any,
  ) {
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }
    return this.beforeAfterService.rejectBeforeAfter(id, req.user.id, reason);
  }
}
