import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreatePiyachokDto {
  @IsUUID()
  institutionId!: string;

  @Type(() => Date)
  @IsDate()
  date!: Date;

  @IsString()
  @MinLength(2)
  @MaxLength(5000)
  description!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  peopleCount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  genderPreference?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  budget?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  whoPays?: string;
}
