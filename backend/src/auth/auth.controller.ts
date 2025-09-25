// backend/src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport'; // <-- Import the Guard
import { Request } from 'express'; // <-- Import Request type

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // 👇 This is our new protected route
  @UseGuards(AuthGuard('jwt')) // This is the "bouncer"
  @Get('profile')
  getProfile(@Req() req: Request) {
    // Because of our JwtStrategy, the user object is now attached to the request
    return req.user;
  }
}