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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { AuthenticatedUser } from '../auth/jwt.strategy';
import { CreateNewsDto } from './dto/create-news.dto';
import { ListNewsQueryDto } from './dto/list-news-query.dto';
import { NewsService } from './news.service';

type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};

@Controller()
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('news')
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createNewsDto: CreateNewsDto,
    @UploadedFile() imageFile: Express.Multer.File | undefined,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.newsService.create(createNewsDto, request.user, imageFile);
  }

  @Get('news')
  findAll(@Query() query: ListNewsQueryDto) {
    return this.newsService.findAll(query);
  }

  @Get('news/:id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.newsService.findOne(id);
  }

  @Get('institutions/:institutionId/news')
  findByInstitution(
    @Param('institutionId', new ParseUUIDPipe()) institutionId: string,
  ) {
    return this.newsService.findByInstitution(institutionId);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('news/:id')
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<void> {
    await this.newsService.remove(id, request.user);
  }
}
