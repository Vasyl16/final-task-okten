import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class ListPublicTopCategoriesQueryDto extends PaginationQueryDto {
  /** Max institutions included per category (nested list cap). */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  institutionsLimit?: number;
}
