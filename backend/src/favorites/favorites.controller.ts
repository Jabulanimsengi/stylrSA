import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { User } from '@prisma/client';

@Controller('api/favorites')
@UseGuards(AuthGuard('jwt'))
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  getMyFavorites(@GetUser() user: User) {
    return this.favoritesService.getMyFavorites(user.id);
  }

  @Post('toggle/:salonId')
  toggleFavorite(
    @GetUser() user: User,
    @Param('salonId') salonId: string,
  ) {
    return this.favoritesService.toggleFavorite(user.id, salonId);
  }
}