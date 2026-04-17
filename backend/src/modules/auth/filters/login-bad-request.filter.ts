import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response } from 'express';
import { LOGIN_FAILED_MESSAGE } from '../auth.constants';

/**
 * Лише для POST /auth/login: будь-який BadRequest (в т.ч. forbidNonWhitelisted)
 * віддаємо як 401 з тим самим повідомленням, що й невірні облікові дані.
 */
@Catch(BadRequestException)
export class LoginBadRequestToUnauthorizedFilter implements ExceptionFilter {
  catch(_exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const unauthorized = new UnauthorizedException(LOGIN_FAILED_MESSAGE);

    return response.status(unauthorized.getStatus()).json(unauthorized.getResponse());
  }
}
