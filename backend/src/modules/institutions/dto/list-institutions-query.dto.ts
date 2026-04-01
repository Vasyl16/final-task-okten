import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class ListInstitutionsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @IsOptional()
  @Transform(({ value }) => String(value).trim())
  @IsString()
  @MaxLength(255)
  search?: string;

  @IsOptional()
  @Transform(({ value }) => String(value).trim())
  @IsString()
  @MaxLength(120)
  city?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minRating?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minAverageCheck?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxAverageCheck?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  userLat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  userLng?: number;

  @IsOptional()
  @IsIn(['createdAt', 'name', 'rating', 'distance', 'views'])
  sort?: 'createdAt' | 'name' | 'rating' | 'distance' | 'views';
}
