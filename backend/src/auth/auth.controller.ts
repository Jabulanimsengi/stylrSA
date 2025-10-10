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
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { Response } from 'express';
import { JwtGuard } from './guard/jwt.guard';
import { GetUser } from './decorator/get-user.decorator';
import { User } from '@prisma/client';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Corrected 'access_token' to 'accessToken' to match the service's return object
    const { accessToken, user } = await this.authService.login(dto);
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
    });
    return { message: 'Login successful', user };
  }

  @UseGuards(JwtGuard)
  @Get('status')
  status(@GetUser() user: User) {
    return { status: 'authenticated', user };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
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
