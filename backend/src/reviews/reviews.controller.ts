// backend/src/reviews/reviews.controller.ts
import { Controller, Post, Body, UseGuards, Get, Patch, Param } from '@nestjs/common';
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

  @UseGuards(AuthGuard('jwt'))
  @Patch(':reviewId')
  update(
    @Param('reviewId') reviewId: string,
    @Body() updateReviewDto: CreateReviewDto,
    @GetUser() user: any,
  ) {
    return this.reviewsService.update(reviewId, user.id, updateReviewDto);
  }

  // NEW: Get salon owner's reviews
  @UseGuards(AuthGuard('jwt'))
  @Get('my-salon-reviews')
  getMySalonReviews(@GetUser() user: any) {
    return this.reviewsService.getSalonOwnerReviews(user.id);
  }

  // NEW: Respond to a review
  @UseGuards(AuthGuard('jwt'))
  @Patch(':reviewId/respond')
  respondToReview(
    @Param('reviewId') reviewId: string,
    @Body() body: { response: string },
    @GetUser() user: any,
  ) {
    return this.reviewsService.respondToReview(reviewId, user.id, body.response);
  }
}
