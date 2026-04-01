import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { AuthenticatedUser } from '../auth/jwt.strategy';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  findMe(@Req() request: AuthenticatedRequest) {
    return this.usersService.findMe(request.user);
  }

  @Patch('me')
  updateMe(
    @Body() updateProfileDto: UpdateProfileDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.usersService.updateMe(request.user, updateProfileDto);
  }
}
