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
  UploadedFile,
  Query,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { VideosService } from './videos.service';

@Controller('api/videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @UseGuards(JwtGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('video'))
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body('salonId') salonId: string,
    @Body('serviceId') serviceId: string | undefined,
    @Body('caption') caption: string | undefined,
    @Req() req: any,
  ) {
    if (!file) {
      throw new Error('Please upload a video file');
    }

    return this.videosService.uploadVideo(
      file,
      salonId,
      serviceId,
      caption,
      req.user.id,
    );
  }

  @Get('approved')
  async getApprovedVideos(
    @Query('limit') limit?: string,
    @Query('salonId') salonId?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.videosService.getApprovedVideos(limitNum, salonId);
  }

  @UseGuards(JwtGuard)
  @Get('my-videos')
  async getMyVideos(@Req() req: any) {
    return this.videosService.getVideosBySalonOwner(req.user.id);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async deleteVideo(@Param('id') id: string, @Req() req: any) {
    return this.videosService.deleteVideo(id, req.user.id);
  }

  @Patch(':id/view')
  async incrementViews(@Param('id') id: string) {
    return this.videosService.incrementViews(id);
  }

  // Admin endpoints
  @UseGuards(JwtGuard)
  @Get('pending')
  async getPendingVideos(@Req() req: any) {
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }
    return this.videosService.getPendingVideos();
  }

  @UseGuards(JwtGuard)
  @Patch(':id/approve')
  async approveVideo(@Param('id') id: string, @Req() req: any) {
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }
    return this.videosService.approveVideo(id, req.user.id);
  }

  @UseGuards(JwtGuard)
  @Patch(':id/reject')
  async rejectVideo(
    @Param('id') id: string,
    @Body('reason') reason: string | undefined,
    @Req() req: any,
  ) {
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }
    return this.videosService.rejectVideo(id, req.user.id, reason);
  }
}
