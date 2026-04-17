import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { AuthenticatedUser } from '../auth/jwt.strategy';
import { OptionalJwtAuthGuard } from '../institutions/optional-jwt.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { ListInstitutionReviewsQueryDto } from './dto/list-institution-reviews-query.dto';
import { ListMyReviewsQueryDto } from './dto/list-my-reviews-query.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsService } from './reviews.service';

type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};

type OptionalAuthenticatedRequest = Request & {
  user?: AuthenticatedUser | null;
};

@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('reviews')
  create(
    @Body() createReviewDto: CreateReviewDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.reviewsService.create(createReviewDto, request.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('reviews/:id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.reviewsService.update(id, updateReviewDto, request.user);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('reviews/:id')
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<void> {
    await this.reviewsService.remove(id, request.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('reviews/my')
  findMine(
    @Req() request: AuthenticatedRequest,
    @Query() query: ListMyReviewsQueryDto,
  ) {
    return this.reviewsService.findMine(request.user, query);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('institutions/:institutionId/reviews')
  findByInstitution(
    @Param('institutionId', new ParseUUIDPipe()) institutionId: string,
    @Query() query: ListInstitutionReviewsQueryDto,
    @Req() request: OptionalAuthenticatedRequest,
  ) {
    return this.reviewsService.findByInstitution(institutionId, query, request.user);
  }
}
