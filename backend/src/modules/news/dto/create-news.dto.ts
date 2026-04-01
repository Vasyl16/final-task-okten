import { IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { NewsCategory } from '@prisma/client';

export class CreateNewsDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  title!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(10000)
  content!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  imageUrl?: string;

  @IsEnum(NewsCategory)
  category!: NewsCategory;

  @IsUUID()
  institutionId!: string;
}
