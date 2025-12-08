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
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { BeforeAfterService } from './before-after.service';

// Configure multer with file size limits
const multerOptions = {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
  },
  fileFilter: (req: any, file: any, callback: any) => {
    if (!file.mimetype.startsWith('image/')) {
      return callback(new BadRequestException('Only image files are allowed'), false);
    }
    callback(null, true);
  },
};

@Controller('api/before-after')
export class BeforeAfterController {
  constructor(private readonly beforeAfterService: BeforeAfterService) { }

  @UseGuards(JwtGuard)
  @Post('upload')
  @UseInterceptors(FilesInterceptor('images', 2, multerOptions))
  async uploadBeforeAfter(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('salonId') salonId: string,
    @Body('serviceId') serviceId: string | undefined,
    @Body('caption') caption: string | undefined,
    @Req() req: any,
  ) {
    try {
      if (!files || files.length !== 2) {
        throw new BadRequestException('Please upload exactly 2 images (before and after)');
      }

      if (!salonId) {
        throw new BadRequestException('Salon ID is required');
      }

      return await this.beforeAfterService.uploadBeforeAfter(
        files,
        salonId,
        serviceId,
        caption,
        req.user.id,
      );
    } catch (error: any) {
      console.error('Before/After upload error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to upload before/after images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
