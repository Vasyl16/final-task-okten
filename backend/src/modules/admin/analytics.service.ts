import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { resolvePageCount, resolvePagination } from '../../common/pagination';
import { PrismaService } from '../../prisma/prisma.service';

export interface InstitutionAnalyticsItem {
  institutionId: string;
  name: string;
  viewsCount: number;
}

export interface InstitutionViewsByDateItem {
  date: string;
  viewsCount: number;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prismaService: PrismaService) {}

  async trackInstitutionView(id: string): Promise<{ success: true }> {
    const institution = await this.prismaService.institution.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!institution) {
      throw new NotFoundException('Institution not found');
    }

    await this.prismaService.$transaction(async (tx) => {
      await tx.viewEvent.create({
        data: {
          institutionId: id,
        },
      });

      await tx.institution.update({
        where: { id },
        data: {
          viewsCount: {
            increment: 1,
          },
        },
      });
    });

    return { success: true };
  }

  async getInstitutionAnalytics(query: PaginationQueryDto): Promise<{
    items: InstitutionAnalyticsItem[];
    total: number;
    page: number;
    limit: number;
    pageCount: number;
  }> {
    const { page, limit, skip } = resolvePagination(query, 12);

    const [total, institutions] = await Promise.all([
      this.prismaService.institution.count(),
      this.prismaService.institution.findMany({
        select: {
          id: true,
          name: true,
          viewsCount: true,
        },
        orderBy: {
          viewsCount: 'desc',
        },
        skip,
        take: limit,
      }),
    ]);

    const pageCount = resolvePageCount(total, limit);

    const items = institutions.map((institution) => ({
      institutionId: institution.id,
      name: institution.name,
      viewsCount: institution.viewsCount,
    }));

    return { items, total, page, limit, pageCount };
  }

  async getInstitutionAnalyticsById(
    institutionId: string,
    query: PaginationQueryDto,
  ): Promise<{
    items: InstitutionViewsByDateItem[];
    total: number;
    page: number;
    limit: number;
    pageCount: number;
  }> {
    const institution = await this.prismaService.institution.findUnique({
      where: { id: institutionId },
      select: { id: true },
    });

    if (!institution) {
      throw new NotFoundException('Institution not found');
    }

    const viewEvents = await this.prismaService.viewEvent.findMany({
      where: {
        institutionId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        createdAt: true,
      },
    });

    const groupedViews = viewEvents.reduce<Map<string, number>>((accumulator, event) => {
      const date = event.createdAt.toISOString().slice(0, 10);
      const currentCount = accumulator.get(date) ?? 0;

      accumulator.set(date, currentCount + 1);

      return accumulator;
    }, new Map<string, number>());

    const sortedDesc = Array.from(groupedViews.entries())
      .map(([date, viewsCount]) => ({
        date,
        viewsCount,
      }))
      .sort((first, second) => second.date.localeCompare(first.date));

    const { page, limit, skip } = resolvePagination(query, 12);
    const total = sortedDesc.length;
    const items = sortedDesc.slice(skip, skip + limit);
    const pageCount = resolvePageCount(total, limit);

    return { items, total, page, limit, pageCount };
  }
}
