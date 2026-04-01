import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Favorite, InstitutionStatus, Prisma } from '@prisma/client';
import { AuthenticatedUser } from '../auth/jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prismaService: PrismaService) {}

  async add(institutionId: string, currentUser: AuthenticatedUser): Promise<Favorite> {
    const institution = await this.prismaService.institution.findUnique({
      where: { id: institutionId },
    });

    if (!institution) {
      throw new NotFoundException('Institution not found');
    }

    if (institution.status !== InstitutionStatus.APPROVED) {
      throw new ForbiddenException('Only approved institutions can be added to favorites');
    }

    try {
      return await this.prismaService.favorite.create({
        data: {
          institutionId,
          userId: currentUser.id,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Institution is already in favorites');
      }

      throw error;
    }
  }

  async remove(institutionId: string, currentUser: AuthenticatedUser): Promise<void> {
    await this.prismaService.favorite.deleteMany({
      where: {
        institutionId,
        userId: currentUser.id,
      },
    });
  }

  async findAll(currentUser: AuthenticatedUser) {
    return this.prismaService.favorite.findMany({
      where: {
        userId: currentUser.id,
        institution: {
          status: InstitutionStatus.APPROVED,
        },
      },
      include: {
        institution: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
