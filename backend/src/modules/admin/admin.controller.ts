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
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';
import { AnalyticsService } from './analytics.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateTopCategoryDto } from '../top-categories/dto/create-top-category.dto';
import { UpdateTopCategoryDto } from '../top-categories/dto/update-top-category.dto';

type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Get('analytics/institutions')
  getInstitutionAnalytics(@Query() query: PaginationQueryDto) {
    return this.analyticsService.getInstitutionAnalytics(query);
  }

  @Get('analytics/institutions/:id')
  getInstitutionAnalyticsById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.analyticsService.getInstitutionAnalyticsById(id, query);
  }

  @Get('institutions/pending')
  getPendingInstitutions(@Query() query: PaginationQueryDto) {
    return this.adminService.getPendingInstitutions(query);
  }

  @Patch('institutions/:id/approve')
  approveInstitution(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adminService.approveInstitution(id, request.user);
  }

  @Patch('institutions/:id/reject')
  rejectInstitution(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adminService.rejectInstitution(id, request.user);
  }

  @Get('users')
  getUsers(@Query() query: PaginationQueryDto) {
    return this.adminService.getUsers(query);
  }

  @Patch('users/:id')
  updateUser(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.adminService.updateUser(id, updateUserDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('users/:id')
  async deleteUser(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.adminService.deleteUser(id);
  }

  @Get('top-categories')
  getTopCategories(@Query() query: PaginationQueryDto) {
    return this.adminService.getTopCategories(query);
  }

  @Post('top-categories')
  createTopCategory(@Body() createTopCategoryDto: CreateTopCategoryDto) {
    return this.adminService.createTopCategory(createTopCategoryDto);
  }

  @Patch('top-categories/:id')
  updateTopCategory(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateTopCategoryDto: UpdateTopCategoryDto,
  ) {
    return this.adminService.updateTopCategory(id, updateTopCategoryDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('top-categories/:id')
  async deleteTopCategory(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.adminService.deleteTopCategory(id);
  }

  @Post('top-categories/:id/institutions/:institutionId')
  addInstitutionToTopCategory(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('institutionId', new ParseUUIDPipe()) institutionId: string,
  ) {
    return this.adminService.addInstitutionToTopCategory(id, institutionId);
  }

  @Delete('top-categories/:id/institutions/:institutionId')
  removeInstitutionFromTopCategory(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('institutionId', new ParseUUIDPipe()) institutionId: string,
  ) {
    return this.adminService.removeInstitutionFromTopCategory(id, institutionId);
  }
}
