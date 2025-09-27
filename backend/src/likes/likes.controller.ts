// backend/src/likes/likes.controller.ts
import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { LikesService } from './likes.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { User } from '@prisma/client';

@Controller('api/likes')
@UseGuards(AuthGuard('jwt'))
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post('service/:serviceId/toggle')
  toggleLike(
    @GetUser() user: User,
    @Param('serviceId') serviceId: string,
  ) {
    return this.likesService.toggleLike(user.id, serviceId);
  }
}