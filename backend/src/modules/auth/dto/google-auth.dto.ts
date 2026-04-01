import { Transform } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

export class GoogleAuthDto {
  @Transform(({ value }) => String(value).trim())
  @IsString()
  @MinLength(10)
  credential!: string;
}
