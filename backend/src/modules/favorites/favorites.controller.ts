import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { AuthenticatedUser } from '../auth/jwt.strategy';
import { ListFavoritesQueryDto } from './dto/list-favorites-query.dto';
import { FavoritesService } from './favorites.service';

type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};

@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':institutionId')
  add(
    @Param('institutionId', new ParseUUIDPipe()) institutionId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.favoritesService.add(institutionId, request.user);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':institutionId')
  async remove(
    @Param('institutionId', new ParseUUIDPipe()) institutionId: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<void> {
    await this.favoritesService.remove(institutionId, request.user);
  }

  @Get('ids')
  findInstitutionIds(@Req() request: AuthenticatedRequest) {
    return this.favoritesService
      .findInstitutionIds(request.user)
      .then((ids) => ({ ids }));
  }

  @Get()
  findAll(
    @Req() request: AuthenticatedRequest,
    @Query() query: ListFavoritesQueryDto,
  ) {
    return this.favoritesService.findAll(request.user, query);
  }
}
