import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedUser } from '../auth/jwt.strategy';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  override handleRequest<TUser = AuthenticatedUser | null>(
    err: unknown,
    user: AuthenticatedUser | null,
    info: { message?: string } | undefined,
    _context: ExecutionContext,
  ): TUser {
    if (err) {
      throw err;
    }

    if (info && info.message !== 'No auth token') {
      throw new UnauthorizedException('Invalid access token');
    }

    return (user ?? null) as TUser;
  }
}
