import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Institution,
  InstitutionStatus,
  Prisma,
  Review,
  UserRole,
} from '@prisma/client';
import { AuthenticatedUser } from '../auth/jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

type ReviewWithAuthorWeight = Review & {
  user: {
    isCritic: boolean;
  };
};

type ReviewWithAuthor = Review & {
  user: {
    id: string;
    name: string;
    email: string;
    isCritic: boolean;
  };
};

type ReviewWithInstitution = ReviewWithAuthor & {
  institution: {
    id: string;
    name: string;
  };
};

@Injectable()
export class ReviewsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    createReviewDto: CreateReviewDto,
    currentUser: AuthenticatedUser,
  ): Promise<Review> {
    const institution = await this.getInstitutionById(createReviewDto.institutionId);

    if (institution.status !== InstitutionStatus.APPROVED) {
      throw new ForbiddenException('Reviews can only be added to approved institutions');
    }

    if (institution.ownerId === currentUser.id) {
      throw new ForbiddenException('Owners cannot review their own institution');
    }

    const existingReview = await this.prismaService.review.findUnique({
      where: {
        userId_institutionId: {
          userId: currentUser.id,
          institutionId: createReviewDto.institutionId,
        },
      },
    });

    if (existingReview) {
      throw new ConflictException('You have already reviewed this institution');
    }

    try {
      return await this.prismaService.$transaction(async (tx) => {
        const review = await tx.review.create({
          data: {
            institutionId: createReviewDto.institutionId,
            userId: currentUser.id,
            rating: createReviewDto.rating,
            text: createReviewDto.text,
            averageCheck: createReviewDto.averageCheck,
          },
        });

        await this.recalculateInstitutionRating(tx, createReviewDto.institutionId);

        return review;
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('You have already reviewed this institution');
      }

      throw error;
    }
  }

  async update(
    id: string,
    updateReviewDto: UpdateReviewDto,
    currentUser: AuthenticatedUser,
  ): Promise<Review> {
    const review = await this.getReviewById(id);

    this.ensureCanModifyReview(review, currentUser, false);

    return this.prismaService.$transaction(async (tx) => {
      const updatedReview = await tx.review.update({
        where: { id },
        data: updateReviewDto,
      });

      await this.recalculateInstitutionRating(tx, review.institutionId);

      return updatedReview;
    });
  }

  async remove(id: string, currentUser: AuthenticatedUser): Promise<void> {
    const review = await this.getReviewById(id);

    this.ensureCanModifyReview(review, currentUser, true);

    await this.prismaService.$transaction(async (tx) => {
      await tx.review.delete({
        where: { id },
      });

      await this.recalculateInstitutionRating(tx, review.institutionId);
    });
  }

  async findByInstitution(
    institutionId: string,
    currentUser?: AuthenticatedUser | null,
  ): Promise<ReviewWithAuthor[]> {
    const institution = await this.getInstitutionById(institutionId);

    this.ensureCanAccessInstitutionReviews(institution, currentUser);

    return this.prismaService.review.findMany({
      where: { institutionId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isCritic: true,
          },
        },
      },
    });
  }

  async findMine(currentUser: AuthenticatedUser): Promise<ReviewWithInstitution[]> {
    return this.prismaService.review.findMany({
      where: {
        userId: currentUser.id,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isCritic: true,
          },
        },
        institution: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  private async getReviewById(id: string): Promise<Review> {
    const review = await this.prismaService.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
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

  private ensureCanModifyReview(
    review: Review,
    currentUser: AuthenticatedUser,
    allowAdmin: boolean,
  ): void {
    if (review.userId === currentUser.id) {
      return;
    }

    if (allowAdmin && currentUser.role === UserRole.ADMIN) {
      return;
    }

    throw new ForbiddenException('You do not have permission to modify this review');
  }

  private ensureCanAccessInstitutionReviews(
    institution: Institution,
    currentUser?: AuthenticatedUser | null,
  ): void {
    if (institution.status === InstitutionStatus.APPROVED) {
      return;
    }

    if (
      currentUser &&
      (currentUser.role === UserRole.ADMIN || currentUser.id === institution.ownerId)
    ) {
      return;
    }

    throw new ForbiddenException('You do not have access to reviews for this institution');
  }

  private async recalculateInstitutionRating(
    tx: Prisma.TransactionClient,
    institutionId: string,
  ): Promise<void> {
    const reviews = await tx.review.findMany({
      where: { institutionId },
      include: {
        user: {
          select: {
            isCritic: true,
          },
        },
      },
    });

    const { weightedSum, totalWeight } = reviews.reduce(
      (accumulator, review) => {
        const weight = this.getReviewWeight(review);

        return {
          weightedSum: accumulator.weightedSum + review.rating * weight,
          totalWeight: accumulator.totalWeight + weight,
        };
      },
      {
        weightedSum: 0,
        totalWeight: 0,
      },
    );

    const averageRating = totalWeight > 0 ? weightedSum / totalWeight : 0;

    await tx.institution.update({
      where: { id: institutionId },
      data: {
        averageRating,
        reviewsCount: reviews.length,
      },
    });
  }

  private getReviewWeight(review: ReviewWithAuthorWeight): number {
    return review.user.isCritic ? 2 : 1;
  }
}
