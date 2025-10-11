// backend/src/reviews/reviews.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('api/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createReviewDto: CreateReviewDto, @GetUser() user: any) {
    return this.reviewsService.create(user.id, createReviewDto);
  }
}
