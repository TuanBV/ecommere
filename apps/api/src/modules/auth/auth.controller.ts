import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { ok } from '../../common/api-response';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return ok(await this.auth.login(dto));
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return ok(await this.auth.refresh(refreshToken));
  }

  @Post('logout')
  logout() {
    return ok({ success: true });
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  me(@Req() req: Request & { user: { sub: string } }) {
    return ok(req.user);
  }
}
