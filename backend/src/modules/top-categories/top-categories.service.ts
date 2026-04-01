import { Injectable } from '@nestjs/common';
import { InstitutionStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TopCategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAllPublic() {
    return this.prismaService.topCategory.findMany({
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
    });
  }
}
