import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { isEmail } from 'class-validator';
import { LOGIN_FAILED_MESSAGE } from './auth.constants';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface TokenUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isCritic: boolean;
}

interface AuthUserResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isCritic: boolean;
}

export interface AuthResponse extends AuthTokens {
  user: AuthUserResponse;
}

@Injectable()
export class AuthService {
  private readonly saltRounds = 10;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const email = registerDto.email.toLowerCase();
    const name = registerDto.name.trim();
    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    if (registerDto.password !== registerDto.passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }

    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      this.saltRounds,
    );
    const user = await this.prismaService.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isCritic: true,
      },
    });

    return this.issueTokens(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const email = loginDto.email.toLowerCase();
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user);
  }

  async loginWithGoogle(googleAuthDto: GoogleAuthDto): Promise<AuthResponse> {
    const clientId = this.resolveGoogleClientId();

    if (!clientId) {
      throw new BadRequestException('Google sign-in is not configured');
    }

    const oauthClient = new OAuth2Client(clientId);

    let payload: {
      sub?: string;
      email?: string;
      email_verified?: boolean;
      name?: string;
    };

    try {
      const ticket = await oauthClient.verifyIdToken({
        idToken: googleAuthDto.credential,
        audience: clientId,
      });
      payload = ticket.getPayload() ?? {};
    } catch {
      throw new UnauthorizedException('Invalid Google credential');
    }

    const googleId = payload.sub;
    const email = payload.email?.toLowerCase().trim();
    const nameFromGoogle = payload.name?.trim();

    if (!googleId || !email) {
      throw new UnauthorizedException('Google profile is incomplete');
    }

    if (payload.email_verified === false) {
      throw new UnauthorizedException('Google email is not verified');
    }

    const displayName = nameFromGoogle && nameFromGoogle.length >= 2 ? nameFromGoogle : email.split('@')[0];

    const byGoogle = await this.prismaService.user.findUnique({
      where: { googleId },
    });

    if (byGoogle) {
      const needsNameUpdate =
        byGoogle.name === 'Unknown User' && displayName && displayName !== byGoogle.name;

      if (needsNameUpdate) {
        const updated = await this.prismaService.user.update({
          where: { id: byGoogle.id },
          data: { name: displayName },
        });

        return this.issueTokens(updated);
      }

      return this.issueTokens(byGoogle);
    }

    const byEmail = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (byEmail) {
      if (byEmail.googleId && byEmail.googleId !== googleId) {
        throw new ConflictException('This email is linked to another Google account');
      }

      const user = await this.prismaService.user.update({
        where: { id: byEmail.id },
        data: { googleId },
      });

      return this.issueTokens(user);
    }

    const placeholderPassword = await bcrypt.hash(
      randomBytes(32).toString('hex'),
      this.saltRounds,
    );

    const user = await this.prismaService.user.create({
      data: {
        name: displayName,
        email,
        googleId,
        password: placeholderPassword,
      },
    });

    return this.issueTokens(user);
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    const payload = await this.verifyRefreshToken(refreshTokenDto.refreshToken);
    const user = await this.prismaService.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user?.refreshToken) {
      throw new UnauthorizedException('Refresh token is invalid');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshTokenDto.refreshToken,
      user.refreshToken,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Refresh token is invalid');
    }

    return this.issueTokens(user);
  }

  async logout(userId: string): Promise<void> {
    await this.prismaService.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  private async issueTokens(user: TokenUser | User): Promise<AuthResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isCritic: user.isCritic,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('jwt.accessSecret'),
        expiresIn: this.configService.getOrThrow<string>(
          'jwt.accessExpiresIn',
        ) as import('ms').StringValue,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
        expiresIn: this.configService.getOrThrow<string>(
          'jwt.refreshExpiresIn',
        ) as import('ms').StringValue,
      }),
    ]);

    await this.storeRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: this.serializeUser(user),
    };
  }

  private serializeUser(user: TokenUser | User): AuthUserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isCritic: user.isCritic,
    };
  }

  private async storeRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, this.saltRounds);

    await this.prismaService.user.update({
      where: { id: userId },
      data: {
        refreshToken: hashedRefreshToken,
      },
    });
  }

  private async verifyRefreshToken(refreshToken: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token is invalid');
    }
  }

  /**
   * ConfigService nested keys can be empty if .env was loaded after first read;
   * fall back to process.env (same as configuration.ts uses).
   */
  private resolveGoogleClientId(): string | undefined {
    const fromConfig = this.configService.get<string>('google.clientId');
    const fromEnv = process.env.GOOGLE_CLIENT_ID;
    const raw = this.stripOptionalQuotes(fromConfig ?? fromEnv ?? '').trim();

    return raw.length > 0 ? raw : undefined;
  }

  private stripOptionalQuotes(value: string): string {
    const trimmed = value.trim();

    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return trimmed.slice(1, -1);
    }

    return trimmed;
  }
}
