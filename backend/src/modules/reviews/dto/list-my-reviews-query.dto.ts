import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class ListMyReviewsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  institutionId?: string;
}
