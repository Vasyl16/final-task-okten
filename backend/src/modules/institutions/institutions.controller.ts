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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { AuthenticatedUser } from '../auth/jwt.strategy';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ListInstitutionsQueryDto } from './dto/list-institutions-query.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { InstitutionsService } from './institutions.service';
import { OptionalJwtAuthGuard } from './optional-jwt.guard';

type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};

type OptionalAuthenticatedRequest = Request & {
  user?: AuthenticatedUser | null;
};

@Controller('institutions')
export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('images', 6))
  create(
    @Body() createInstitutionDto: CreateInstitutionDto,
    @UploadedFiles() imageFiles: Express.Multer.File[],
    @Req() request: AuthenticatedRequest,
  ) {
    return this.institutionsService.create(
      createInstitutionDto,
      request.user,
      imageFiles ?? [],
    );
  }

  @Get()
  findAll(@Query() query: ListInstitutionsQueryDto) {
    return this.institutionsService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  findMine(
    @Query() query: PaginationQueryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.institutionsService.findMine(request.user, query);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: OptionalAuthenticatedRequest,
  ) {
    return this.institutionsService.findOne(id, request.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images', 6))
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateInstitutionDto: UpdateInstitutionDto,
    @UploadedFiles() imageFiles: Express.Multer.File[],
    @Req() request: AuthenticatedRequest,
  ) {
    return this.institutionsService.update(
      id,
      updateInstitutionDto,
      request.user,
      imageFiles ?? [],
    );
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<void> {
    await this.institutionsService.remove(id, request.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/approve')
  approve(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.institutionsService.approve(id, request.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/reject')
  reject(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.institutionsService.reject(id, request.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/view')
  trackView(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.institutionsService.trackView(id);
  }
}
