import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTopCategoryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name!: string;
}
