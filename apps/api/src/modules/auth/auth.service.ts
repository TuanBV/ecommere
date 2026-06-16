import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repo';
import { LoginDto } from './dto/login.dto';

type TokenPayload = { sub: string; username: string; role: number };

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {}

  async login(dto: LoginDto) {
    const user = await this.authRepository.findActiveUserByLogin(dto.username);
    if (!user?.password) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    const payload: TokenPayload = { sub: user.id, username: user.username, role: user.role ?? 1 };
    return {
      accessToken: await this.signAccess(payload),
      refreshToken: await this.signRefresh(payload),
      user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName, role: user.role }
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync<TokenPayload>(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET')
      });
      return {
        accessToken: await this.signAccess(payload),
        refreshToken: await this.signRefresh(payload)
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private signAccess(payload: TokenPayload) {
    return this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get<string>('JWT_ACCESS_TTL') ?? '15m'
    });
  }

  private signRefresh(payload: TokenPayload) {
    return this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_TTL') ?? '7d'
    });
  }
}
