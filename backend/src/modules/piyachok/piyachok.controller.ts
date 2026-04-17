import {
  Body,
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
import { Piyachok } from '@prisma/client';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { AuthenticatedUser } from '../auth/jwt.strategy';
import { CreatePiyachokDto } from './dto/create-piyachok.dto';
import { PiyachokDetailDto } from './dto/piyachok-detail.dto';
import { ListMyPiyachokQueryDto } from './dto/list-my-piyachok-query.dto';
import { ListPublicPiyachokQueryDto } from './dto/list-public-piyachok-query.dto';
import { PublicPiyachokItemDto } from './dto/public-piyachok-item.dto';
import { PiyachokService } from './piyachok.service';

type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};

@UseGuards(JwtAuthGuard)
@Controller('piyachok')
export class PiyachokController {
  constructor(private readonly piyachokService: PiyachokService) {}

  @Get()
  findPublic(@Query() query: ListPublicPiyachokQueryDto): Promise<{
    items: PublicPiyachokItemDto[];
    total: number;
    page: number;
    limit: number;
    pageCount: number;
  }> {
    return this.piyachokService.findPublic(query);
  }

  @Get('my')
  findMine(
    @Req() request: AuthenticatedRequest,
    @Query() query: ListMyPiyachokQueryDto,
  ) {
    return this.piyachokService.findMine(request.user, query);
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<PiyachokDetailDto> {
    return this.piyachokService.findOneById(id);
  }

  @Post()
  create(
    @Body() createPiyachokDto: CreatePiyachokDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<Piyachok> {
    return this.piyachokService.create(createPiyachokDto, request.user);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<void> {
    await this.piyachokService.remove(id, request.user);
  }
}
