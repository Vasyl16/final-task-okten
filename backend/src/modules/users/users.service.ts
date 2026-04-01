import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../auth/jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findMe(currentUser: AuthenticatedUser) {
    return this.prismaService.user.findUniqueOrThrow({
      where: { id: currentUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isCritic: true,
        createdAt: true,
      },
    });
  }

  async updateMe(currentUser: AuthenticatedUser, updateProfileDto: UpdateProfileDto) {
    return this.prismaService.user.update({
      where: { id: currentUser.id },
      data: {
        name: updateProfileDto.name,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isCritic: true,
        createdAt: true,
      },
    });
  }
}
