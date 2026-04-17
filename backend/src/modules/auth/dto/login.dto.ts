import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';

/**
 * Лише типи полів для whitelist. Формат email і «заповненість» перевіряються в AuthService.login
 * з єдиною відповіддю 401 (без деталей валідації в тілі відповіді).
 */
export class LoginDto {
  @Transform(({ value }) =>
    value === undefined || value === null ? '' : String(value).trim(),
  )
  @IsString()
  email!: string;

  @Transform(({ value }) =>
    value === undefined || value === null ? '' : String(value),
  )
  @IsString()
  password!: string;
}
