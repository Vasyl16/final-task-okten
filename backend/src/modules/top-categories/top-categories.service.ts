import { Injectable } from '@nestjs/common';
import { InstitutionStatus } from '@prisma/client';
import { resolvePageCount, resolvePagination } from '../../common/pagination';
import { PrismaService } from '../../prisma/prisma.service';
import { ListPublicTopCategoriesQueryDto } from './dto/list-public-top-categories-query.dto';

@Injectable()
export class TopCategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAllPublic(query: ListPublicTopCategoriesQueryDto) {
    const { page, limit, skip } = resolvePagination(query, 12);
    const institutionsTake = Math.min(
      50,
      Math.max(1, query.institutionsLimit ?? 12),
    );

    const [total, items] = await Promise.all([
      this.prismaService.topCategory.count(),
      this.prismaService.topCategory.findMany({
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          institutions: {
            where: {
              status: InstitutionStatus.APPROVED,
            },
            orderBy: {
              averageRating: 'desc',
            },
            take: institutionsTake,
            select: {
              id: true,
              name: true,
              description: true,
              images: true,
              lat: true,
              lng: true,
              averageRating: true,
              reviewsCount: true,
              viewsCount: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
    ]);

    const pageCount = resolvePageCount(total, limit);

    return { items, total, page, limit, pageCount };
  }
}
