import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { resolvePageCount, resolvePagination } from '../../common/pagination';
import { AuthenticatedUser } from '../auth/jwt.strategy';
import { InstitutionsService } from '../institutions/institutions.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateTopCategoryDto } from '../top-categories/dto/create-top-category.dto';
import { UpdateTopCategoryDto } from '../top-categories/dto/update-top-category.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly institutionsService: InstitutionsService,
  ) {}

  async getPendingInstitutions(query: PaginationQueryDto) {
    return this.institutionsService.findPending(query);
  }

  async approveInstitution(id: string, currentUser: AuthenticatedUser) {
    return this.institutionsService.approve(id, currentUser);
  }

  async rejectInstitution(id: string, currentUser: AuthenticatedUser) {
    return this.institutionsService.reject(id, currentUser);
  }

  async getUsers(query: PaginationQueryDto) {
    const { page, limit, skip } = resolvePagination(query, 12);
    const [total, items] = await Promise.all([
      this.prismaService.user.count(),
      this.prismaService.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isCritic: true,
          createdAt: true,
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

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    try {
      return await this.prismaService.user.update({
        where: { id },
        data: updateUserDto,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isCritic: true,
          createdAt: true,
        },
      });
    } catch (error) {
      this.throwIfRecordNotFound(error, 'User not found');
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await this.prismaService.user.delete({
        where: { id },
      });
    } catch (error) {
      this.throwIfRecordNotFound(error, 'User not found');
      throw error;
    }
  }

  async getTopCategories(query: PaginationQueryDto) {
    const { page, limit, skip } = resolvePagination(query, 12);

    const [total, items] = await Promise.all([
      this.prismaService.topCategory.count(),
      this.prismaService.topCategory.findMany({
        include: {
          institutions: {
            select: {
              id: true,
              name: true,
              status: true,
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

  async createTopCategory(createTopCategoryDto: CreateTopCategoryDto) {
    return this.prismaService.topCategory.create({
      data: createTopCategoryDto,
    });
  }

  async updateTopCategory(id: string, updateTopCategoryDto: UpdateTopCategoryDto) {
    try {
      return await this.prismaService.topCategory.update({
        where: { id },
        data: updateTopCategoryDto,
      });
    } catch (error) {
      this.throwIfRecordNotFound(error, 'Top category not found');
      throw error;
    }
  }

  async deleteTopCategory(id: string): Promise<void> {
    try {
      await this.prismaService.topCategory.delete({
        where: { id },
      });
    } catch (error) {
      this.throwIfRecordNotFound(error, 'Top category not found');
      throw error;
    }
  }

  async addInstitutionToTopCategory(id: string, institutionId: string) {
    await this.ensureInstitutionExists(institutionId);

    try {
      return await this.prismaService.topCategory.update({
        where: { id },
        data: {
          institutions: {
            connect: {
              id: institutionId,
            },
          },
        },
        include: {
          institutions: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
      });
    } catch (error) {
      this.throwIfRecordNotFound(error, 'Top category not found');
      throw error;
    }
  }

  async removeInstitutionFromTopCategory(id: string, institutionId: string) {
    try {
      return await this.prismaService.topCategory.update({
        where: { id },
        data: {
          institutions: {
            disconnect: {
              id: institutionId,
            },
          },
        },
        include: {
          institutions: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
      });
    } catch (error) {
      this.throwIfRecordNotFound(error, 'Top category not found');
      throw error;
    }
  }

  private throwIfRecordNotFound(error: unknown, message: string): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException(message);
    }
  }

  private async ensureInstitutionExists(institutionId: string): Promise<void> {
    const institution = await this.prismaService.institution.findUnique({
      where: { id: institutionId },
      select: { id: true },
    });

    if (!institution) {
      throw new NotFoundException('Institution not found');
    }
  }
}
