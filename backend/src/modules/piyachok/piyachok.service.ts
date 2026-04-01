import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Piyachok, Prisma } from '@prisma/client';
import { AuthenticatedUser } from '../auth/jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePiyachokDto } from './dto/create-piyachok.dto';
import { PiyachokDetailDto } from './dto/piyachok-detail.dto';
import { ListPublicPiyachokQueryDto } from './dto/list-public-piyachok-query.dto';
import { PublicPiyachokItemDto } from './dto/public-piyachok-item.dto';

type PiyachokWithUserName = Piyachok & {
  user: {
    name: string;
  };
};

@Injectable()
export class PiyachokService {
  constructor(private readonly prismaService: PrismaService) {}

  async findPublic(query: ListPublicPiyachokQueryDto): Promise<{
    items: PublicPiyachokItemDto[];
    total: number;
    page: number;
    limit: number;
    pageCount: number;
  }> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 12));
    const skip = (page - 1) * limit;
    const dateFrom = query.dateFrom ?? new Date();
    const searchTerm = query.search?.trim() ?? '';

    /** Без пошуку — лише майбутні зустрічі. З пошуком — усі записи, що відповідають тексту (інакше старі зустрічі ніколи не знаходяться). */
    const onlyUpcoming = !searchTerm;

    const where: Prisma.PiyachokWhereInput = {
      ...(onlyUpcoming
        ? {
            date: {
              gt: dateFrom,
            },
          }
        : {}),
      ...(query.institutionId
        ? {
            institutionId: query.institutionId,
          }
        : {}),
      ...(searchTerm
        ? {
            OR: [
              {
                description: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
              {
                institution: {
                  name: {
                    contains: searchTerm,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          }
        : {}),
    };

    const sortBy = query.sortBy ?? 'date';
    const sortOrder = query.sortOrder ?? 'asc';

    const orderBy: Prisma.PiyachokOrderByWithRelationInput =
      sortBy === 'createdAt'
        ? { createdAt: sortOrder }
        : { date: sortOrder };

    const [total, rows] = await Promise.all([
      this.prismaService.piyachok.count({ where }),
      this.prismaService.piyachok.findMany({
        where,
        select: {
          id: true,
          user: {
            select: {
              name: true,
            },
          },
          institution: {
            select: {
              id: true,
              name: true,
            },
          },
          date: true,
          description: true,
          peopleCount: true,
          budget: true,
          createdAt: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    const pageCount = Math.max(1, Math.ceil(total / limit));

    return {
      items: rows,
      total,
      page,
      limit,
      pageCount,
    };
  }

  async findOneById(id: string): Promise<PiyachokDetailDto> {
    const row = await this.prismaService.piyachok.findUnique({
      where: { id },
      select: {
        id: true,
        date: true,
        description: true,
        peopleCount: true,
        genderPreference: true,
        budget: true,
        whoPays: true,
        createdAt: true,
        user: {
          select: {
            name: true,
          },
        },
        institution: {
          select: {
            id: true,
            name: true,
            lat: true,
            lng: true,
          },
        },
      },
    });

    if (!row) {
      throw new NotFoundException('Piyachok request not found');
    }

    return row;
  }

  async create(
    createPiyachokDto: CreatePiyachokDto,
    currentUser: AuthenticatedUser,
  ): Promise<Piyachok> {
    const institution = await this.prismaService.institution.findUnique({
      where: { id: createPiyachokDto.institutionId },
      select: { id: true },
    });

    if (!institution) {
      throw new NotFoundException('Institution not found');
    }

    if (createPiyachokDto.date <= new Date()) {
      throw new BadRequestException('Date must be in the future');
    }

    return this.prismaService.piyachok.create({
      data: {
        ...createPiyachokDto,
        userId: currentUser.id,
      },
    });
  }

  async findMine(currentUser: AuthenticatedUser): Promise<PiyachokWithUserName[]> {
    return this.prismaService.piyachok.findMany({
      where: {
        userId: currentUser.id,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async remove(id: string, currentUser: AuthenticatedUser): Promise<void> {
    const piyachok = await this.prismaService.piyachok.findUnique({
      where: { id },
    });

    if (!piyachok) {
      throw new NotFoundException('Piyachok request not found');
    }

    if (piyachok.userId !== currentUser.id) {
      throw new ForbiddenException('Only the creator can delete this piyachok request');
    }

    await this.prismaService.piyachok.delete({
      where: { id },
    });
  }
}
