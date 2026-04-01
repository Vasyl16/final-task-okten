import { Module } from '@nestjs/common';
import { OptionalJwtAuthGuard } from '../institutions/optional-jwt.guard';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService, OptionalJwtAuthGuard],
})
export class ReviewsModule {}
