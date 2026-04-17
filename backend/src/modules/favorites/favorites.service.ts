import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Favorite, Institution, InstitutionStatus, Prisma } from '@prisma/client';
import { resolvePageCount, resolvePagination } from '../../common/pagination';
import { AuthenticatedUser } from '../auth/jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';
import { ListFavoritesQueryDto } from './dto/list-favorites-query.dto';

type FavoriteWithInstitution = Favorite & {
  institution: Institution;
};

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

  async findInstitutionIds(currentUser: AuthenticatedUser): Promise<string[]> {
    const rows = await this.prismaService.favorite.findMany({
      where: {
        userId: currentUser.id,
        institution: {
          status: InstitutionStatus.APPROVED,
        },
      },
      select: {
        institutionId: true,
      },
    });

    return rows.map((row) => row.institutionId);
  }

  async findAll(
    currentUser: AuthenticatedUser,
    query: ListFavoritesQueryDto,
  ): Promise<{
    items: FavoriteWithInstitution[];
    total: number;
    page: number;
    limit: number;
    pageCount: number;
  }> {
    const { page, limit, skip } = resolvePagination(query, 12);

    const where = {
      userId: currentUser.id,
      institution: {
        status: InstitutionStatus.APPROVED,
      },
    };

    const [total, rows] = await Promise.all([
      this.prismaService.favorite.count({ where }),
      this.prismaService.favorite.findMany({
        where,
        include: {
          institution: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
    ]);

    const pageCount = resolvePageCount(total, limit);

    return {
      items: rows,
      total,
      page,
      limit,
      pageCount,
    };
  }
}
