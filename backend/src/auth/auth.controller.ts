// backend/src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Get,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { Response } from 'express';
import { JwtGuard } from './guard/jwt.guard';
import { GetUser } from './decorator/get-user.decorator';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Throttle({ auth: { limit: 5, ttl: 900000 } }) // 5 attempts per 15 minutes
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Throttle({ auth: { limit: 5, ttl: 900000 } }) // 5 attempts per 15 minutes
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Corrected 'access_token' to 'accessToken' to match the service's return object
    const { accessToken, user } = await this.authService.login(dto);
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as any,
      domain: process.env.COOKIE_DOMAIN || undefined,
      maxAge: 1000 * 60 * 60 * 24, // 1 day in milliseconds
      path: '/',
    });
    return { message: 'Login successful', user };
  }

  @UseGuards(JwtGuard)
  @Get('status')
  status(@GetUser() user: any) {
    return { status: 'authenticated', user };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as any,
      domain: process.env.COOKIE_DOMAIN || undefined,
      path: '/',
    });
    return { message: 'Logout successful' };
  }

  @HttpCode(HttpStatus.OK)
  @Post('sso')
  async sso(
    @Body()
    body: {
      provider: string;
      providerAccountId: string;
      email?: string | null;
      name?: string | null;
    },
  ) {
    return this.authService.sso(body);
  }
}
