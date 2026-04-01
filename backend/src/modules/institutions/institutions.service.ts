import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Institution,
  InstitutionStatus,
  Prisma,
  UserRole,
} from '@prisma/client';
import { StorageService } from '../../common/storage/storage.service';
import { AnalyticsService } from '../admin/analytics.service';
import { AuthenticatedUser } from '../auth/jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { ListInstitutionsQueryDto } from './dto/list-institutions-query.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';

@Injectable()
export class InstitutionsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly analyticsService: AnalyticsService,
    private readonly storageService: StorageService,
  ) {}

  async create(
    createInstitutionDto: CreateInstitutionDto,
    currentUser: AuthenticatedUser,
    imageFiles: Express.Multer.File[],
  ): Promise<Institution> {
    this.ensureUserRole(currentUser);
    const imageUrls = await this.storageService.uploadImages(
      imageFiles,
      'institutions',
    );

    return this.prismaService.institution.create({
      data: {
        ...createInstitutionDto,
        images: imageUrls,
        ownerId: currentUser.id,
        status: InstitutionStatus.PENDING,
      },
    });
  }

  async findAll(query: ListInstitutionsQueryDto): Promise<{
    items: Institution[];
    total: number;
    page: number;
    limit: number;
    pageCount: number;
  }> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 12));
    const skip = (page - 1) * limit;

    if (
      query.sort === 'distance' &&
      (query.userLat === undefined || query.userLng === undefined)
    ) {
      throw new BadRequestException(
        'userLat and userLng are required for distance sorting',
      );
    }

    const shouldFilterByAverageCheck =
      query.minAverageCheck !== undefined ||
      query.maxAverageCheck !== undefined;

    const where: Prisma.InstitutionWhereInput = {
      status: InstitutionStatus.APPROVED,
      ...(query.search
        ? {
            name: {
              contains: query.search,
              mode: 'insensitive',
            },
          }
        : {}),
      ...(query.city?.trim()
        ? {
            city: {
              contains: query.city.trim(),
              mode: 'insensitive',
            },
          }
        : {}),
      ...(query.minRating !== undefined
        ? {
            averageRating: {
              gte: query.minRating,
            },
          }
        : {}),
    };

    if (shouldFilterByAverageCheck) {
      const allWithReviews = await this.prismaService.institution.findMany({
        where,
        orderBy: this.getOrderBy(
          query.sort === 'distance' ? undefined : query.sort,
        ),
        include: {
          reviews: {
            select: {
              averageCheck: true,
            },
          },
        },
      });

      let filtered = allWithReviews.filter((institution) =>
        this.matchesAverageCheckFilters(
          institution.reviews,
          query.minAverageCheck,
          query.maxAverageCheck,
        ),
      );

      if (query.sort === 'distance') {
        const userLat = query.userLat as number;
        const userLng = query.userLng as number;

        filtered = [...filtered].sort(
          (firstInstitution, secondInstitution) =>
            this.calculateDistance(
              firstInstitution.lat,
              firstInstitution.lng,
              userLat,
              userLng,
            ) -
            this.calculateDistance(
              secondInstitution.lat,
              secondInstitution.lng,
              userLat,
              userLng,
            ),
        );
      }

      const stripped = filtered.map(
        ({ reviews: _r, ...rest }) => rest as Institution,
      );
      const total = stripped.length;
      const pageCount = Math.max(1, Math.ceil(total / limit));
      const items = stripped.slice(skip, skip + limit);

      return { items, total, page, limit, pageCount };
    }

    if (query.sort === 'distance') {
      const userLat = query.userLat as number;
      const userLng = query.userLng as number;
      const all = await this.prismaService.institution.findMany({ where });
      const sorted = [...all].sort(
        (firstInstitution, secondInstitution) =>
          this.calculateDistance(
            firstInstitution.lat,
            firstInstitution.lng,
            userLat,
            userLng,
          ) -
          this.calculateDistance(
            secondInstitution.lat,
            secondInstitution.lng,
            userLat,
            userLng,
          ),
      );
      const total = sorted.length;
      const pageCount = Math.max(1, Math.ceil(total / limit));
      const items = sorted.slice(skip, skip + limit);

      return { items, total, page, limit, pageCount };
    }

    const orderBy = this.getOrderBy(query.sort);

    const [total, items] = await Promise.all([
      this.prismaService.institution.count({ where }),
      this.prismaService.institution.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    const pageCount = Math.max(1, Math.ceil(total / limit));

    return { items, total, page, limit, pageCount };
  }

  async findOne(
    id: string,
    currentUser?: AuthenticatedUser | null,
  ): Promise<Institution> {
    const institution = await this.getInstitutionById(id);

    if (institution.status === InstitutionStatus.APPROVED) {
      return institution;
    }

    if (!currentUser) {
      throw new ForbiddenException(
        'You do not have access to this institution',
      );
    }

    if (
      currentUser.role === UserRole.ADMIN ||
      institution.ownerId === currentUser.id
    ) {
      return institution;
    }

    throw new ForbiddenException('You do not have access to this institution');
  }

  async findMine(currentUser: AuthenticatedUser): Promise<Institution[]> {
    return this.prismaService.institution.findMany({
      where: {
        ownerId: currentUser.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(
    id: string,
    updateInstitutionDto: UpdateInstitutionDto,
    currentUser: AuthenticatedUser,
    imageFiles: Express.Multer.File[],
  ): Promise<Institution> {
    const institution = await this.getInstitutionById(id);

    this.ensureOwner(institution, currentUser);

    const { replaceImages, existingImages, ...restDto } = updateInstitutionDto;
    const nextImages = await this.resolveUpdatedImages(
      institution.images,
      imageFiles,
      replaceImages,
      existingImages,
    );
    const persistedImages = nextImages ?? institution.images;

    const removedImages = institution.images.filter(
      (imageUrl) => !persistedImages.includes(imageUrl),
    );

    const updatedInstitution = await this.prismaService.institution.update({
      where: { id },
      data: {
        ...restDto,
        ...(nextImages ? { images: nextImages } : {}),
      },
    });

    await this.storageService.deleteFiles(removedImages);

    return updatedInstitution;
  }

  async remove(id: string, currentUser: AuthenticatedUser): Promise<void> {
    const institution = await this.getInstitutionById(id);

    this.ensureOwner(institution, currentUser);

    await this.prismaService.institution.delete({
      where: { id },
    });

    await this.storageService.deleteFiles(institution.images);
  }

  async approve(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<Institution> {
    this.ensureAdmin(currentUser);

    await this.getInstitutionById(id);

    return this.prismaService.institution.update({
      where: { id },
      data: { status: InstitutionStatus.APPROVED },
    });
  }

  async reject(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<Institution> {
    this.ensureAdmin(currentUser);

    await this.getInstitutionById(id);

    return this.prismaService.institution.update({
      where: { id },
      data: { status: InstitutionStatus.REJECTED },
    });
  }

  async findPending(): Promise<Institution[]> {
    return this.prismaService.institution.findMany({
      where: {
        status: InstitutionStatus.PENDING,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async trackView(id: string): Promise<{ success: true }> {
    return this.analyticsService.trackInstitutionView(id);
  }

  private async getInstitutionById(id: string): Promise<Institution> {
    const institution = await this.prismaService.institution.findUnique({
      where: { id },
    });

    if (!institution) {
      throw new NotFoundException('Institution not found');
    }

    return institution;
  }

  private ensureOwner(
    institution: Institution,
    currentUser: AuthenticatedUser,
  ): void {
    if (institution.ownerId !== currentUser.id) {
      throw new ForbiddenException(
        'Only the owner can modify this institution',
      );
    }
  }

  private ensureAdmin(currentUser: AuthenticatedUser): void {
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can moderate institutions');
    }
  }

  private ensureUserRole(currentUser: AuthenticatedUser): void {
    if (currentUser.role !== UserRole.USER) {
      throw new ForbiddenException('Only users can create institutions');
    }
  }

  private getOrderBy(
    sort?: ListInstitutionsQueryDto['sort'],
  ): Prisma.InstitutionOrderByWithRelationInput {
    switch (sort) {
      case 'name':
        return { name: 'asc' };
      case 'rating':
        return { averageRating: 'desc' };
      case 'views':
        return { viewsCount: 'desc' };
      case 'distance':
      case 'createdAt':
      default:
        return { createdAt: 'desc' };
    }
  }

  private matchesAverageCheckFilters(
    reviews: Array<{ averageCheck: number | null }>,
    minAverageCheck?: number,
    maxAverageCheck?: number,
  ): boolean {
    const averageChecks = reviews
      .map((review) => review.averageCheck)
      .filter((averageCheck): averageCheck is number => averageCheck !== null);

    if (averageChecks.length === 0) {
      return false;
    }

    const averageCheck =
      averageChecks.reduce((sum, value) => sum + value, 0) /
      averageChecks.length;

    if (minAverageCheck !== undefined && averageCheck < minAverageCheck) {
      return false;
    }

    if (maxAverageCheck !== undefined && averageCheck > maxAverageCheck) {
      return false;
    }

    return true;
  }

  private calculateDistance(
    institutionLat: number,
    institutionLng: number,
    userLat: number,
    userLng: number,
  ): number {
    const latDiff = institutionLat - userLat;
    const lngDiff = institutionLng - userLng;

    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
  }

  private async resolveUpdatedImages(
    currentImages: string[],
    imageFiles: Express.Multer.File[],
    replaceImages?: boolean,
    existingImages?: string[],
  ): Promise<string[] | null> {
    if (existingImages) {
      const hasUnknownImage = existingImages.some(
        (imageUrl) => !currentImages.includes(imageUrl),
      );

      if (hasUnknownImage) {
        throw new BadRequestException('Invalid existing image reference');
      }
    }

    const keptImages = replaceImages ? [] : (existingImages ?? currentImages);

    if (imageFiles.length > 0) {
      const uploadedImages = await this.storageService.uploadImages(
        imageFiles,
        'institutions',
      );

      return [...keptImages, ...uploadedImages];
    }

    if (replaceImages || existingImages) {
      return keptImages;
    }

    return currentImages.length ? currentImages : null;
  }
}
