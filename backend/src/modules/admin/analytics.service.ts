import { Injectable, NotFoundException } from '@nestjs/common';
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

  async getInstitutionAnalytics(): Promise<InstitutionAnalyticsItem[]> {
    const institutions = await this.prismaService.institution.findMany({
      select: {
        id: true,
        name: true,
        viewsCount: true,
      },
      orderBy: {
        viewsCount: 'desc',
      },
    });

    return institutions.map((institution) => ({
      institutionId: institution.id,
      name: institution.name,
      viewsCount: institution.viewsCount,
    }));
  }

  async getInstitutionAnalyticsById(
    institutionId: string,
  ): Promise<InstitutionViewsByDateItem[]> {
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

    return Array.from(groupedViews.entries()).map(([date, viewsCount]) => ({
      date,
      viewsCount,
    }));
  }
}
