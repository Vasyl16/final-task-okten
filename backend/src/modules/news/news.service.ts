import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { News, NewsCategory, Prisma, UserRole } from '@prisma/client';
import { StorageService } from '../../common/storage/storage.service';
import { AuthenticatedUser } from '../auth/jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { ListNewsQueryDto } from './dto/list-news-query.dto';

@Injectable()
export class NewsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async create(
    createNewsDto: CreateNewsDto,
    currentUser: AuthenticatedUser,
    imageFile?: Express.Multer.File,
  ): Promise<News> {
    const institution = await this.prismaService.institution.findUnique({
      where: { id: createNewsDto.institutionId },
    });

    if (!institution) {
      throw new NotFoundException('Institution not found');
    }

    if (institution.ownerId !== currentUser.id) {
      throw new ForbiddenException('Only the institution owner can create news');
    }

    if (
      createNewsDto.category === NewsCategory.PROMOTION ||
      createNewsDto.category === NewsCategory.EVENT
    ) {
      // TODO: require payment (Stripe integration later)
    }

    const imageUrl = imageFile
      ? await this.storageService.uploadImage(imageFile, 'news')
      : createNewsDto.imageUrl?.trim() || undefined;

    return this.prismaService.news.create({
      data: {
        ...createNewsDto,
        imageUrl,
      },
    });
  }

  async remove(id: string, currentUser: AuthenticatedUser): Promise<void> {
    const news = await this.prismaService.news.findUnique({
      where: { id },
      include: {
        institution: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!news) {
      throw new NotFoundException('News item not found');
    }

    if (
      news.institution.ownerId !== currentUser.id &&
      currentUser.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('You do not have permission to delete this news item');
    }

    await this.prismaService.news.delete({
      where: { id },
    });
  }

  async findAll(query: ListNewsQueryDto): Promise<{
    items: News[];
    total: number;
    page: number;
    limit: number;
    pageCount: number;
  }> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 12));
    const skip = (page - 1) * limit;

    const where: Prisma.NewsWhereInput = {
      ...(query.category
        ? {
            category: query.category,
          }
        : {}),
      ...(query.search?.trim()
        ? {
            title: {
              contains: query.search.trim(),
              mode: 'insensitive',
            },
          }
        : {}),
    };

    const orderBy: Prisma.NewsOrderByWithRelationInput =
      query.sort === 'asc'
        ? { createdAt: 'asc' }
        : { createdAt: 'desc' };

    const [total, items] = await Promise.all([
      this.prismaService.news.count({ where }),
      this.prismaService.news.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    const pageCount = Math.max(1, Math.ceil(total / limit));

    return { items, total, page, limit, pageCount };
  }

  async findOne(id: string): Promise<News> {
    const news = await this.prismaService.news.findUnique({
      where: { id },
    });

    if (!news) {
      throw new NotFoundException('News item not found');
    }

    return news;
  }

  async findByInstitution(institutionId: string): Promise<News[]> {
    const institution = await this.prismaService.institution.findUnique({
      where: { id: institutionId },
      select: { id: true },
    });

    if (!institution) {
      throw new NotFoundException('Institution not found');
    }

    return this.prismaService.news.findMany({
      where: { institutionId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
