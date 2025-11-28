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
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { Response } from 'express';
import { JwtGuard } from './guard/jwt.guard';
import { GetUser } from './decorator/get-user.decorator';
import { TwoFactorService } from './two-factor.service';
import { MailService } from '../mail/mail.service';

@Controller('api/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private twoFactorService: TwoFactorService,
    private mailService: MailService,
  ) {}

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
    // Only set secure cookies if actually running on HTTPS
    // This allows local testing with `npm run start` on http://localhost
    const isSecure = process.env.NODE_ENV === 'production' && 
      (process.env.COOKIE_DOMAIN?.includes('.') || false); // Has a real domain = production
    // Set cookie domain if explicitly configured (for deployed environments)
    // If not set, undefined allows cookies to work on localhost
    const cookieDomain = process.env.COOKIE_DOMAIN || undefined;
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax' as any,
      domain: cookieDomain,
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
    // Only set secure cookies if actually running on HTTPS
    const isSecure = process.env.NODE_ENV === 'production' && 
      (process.env.COOKIE_DOMAIN?.includes('.') || false);
    // Set cookie domain if explicitly configured (for deployed environments)
    // Must match the domain used when setting the cookie
    const cookieDomain = process.env.COOKIE_DOMAIN || undefined;
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax' as any,
      domain: cookieDomain,
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
      role?: string | null;
    },
  ) {
    return this.authService.sso(body);
  }

  @HttpCode(HttpStatus.OK)
  @Post('verify-email')
  verifyEmail(@Body('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Throttle({ auth: { limit: 3, ttl: 900000 } }) // 3 attempts per 15 minutes
  @HttpCode(HttpStatus.OK)
  @Post('resend-verification')
  resendVerification(@Body('email') email: string) {
    return this.authService.resendVerificationEmail(email);
  }

  // ====== 2FA ENDPOINTS ======

  @UseGuards(JwtGuard)
  @Post('2fa/setup')
  async setup2FA(@GetUser() user: any) {
    // Only admins can enable 2FA
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('2FA is only available for admin accounts');
    }

    // Check if already enabled
    const is2FAEnabled = await this.twoFactorService.is2FAEnabled(user.id);
    if (is2FAEnabled) {
      throw new ForbiddenException('2FA is already enabled on this account');
    }

    const { secret, qrCodeUrl } = await this.twoFactorService.generateSecret(user.id);
    
    return {
      secret,
      qrCodeUrl,
      message: 'Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)',
    };
  }

  @UseGuards(JwtGuard)
  @Post('2fa/enable')
  async enable2FA(@GetUser() user: any, @Body('token') token: string) {
    // Only admins can enable 2FA
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('2FA is only available for admin accounts');
    }

    // Get the temporary secret from the user's session (stored in setup step)
    const { secret } = await this.twoFactorService.generateSecret(user.id);
    
    // Verify the token
    const isValid = this.twoFactorService.verifyToken(secret, token);
    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA code. Please try again.');
    }

    // Generate backup codes
    const backupCodes = this.twoFactorService.generateBackupCodes();

    // Enable 2FA
    await this.twoFactorService.enable2FA(user.id, secret, backupCodes);

    // Send confirmation email
    await this.mailService.send2FASetupEmail(user.email, user.firstName);

    return {
      message: '2FA enabled successfully',
      backupCodes,
      warning: 'Save these backup codes in a safe place. You will need them if you lose access to your authenticator app.',
    };
  }

  @UseGuards(JwtGuard)
  @Post('2fa/verify')
  async verify2FA(@GetUser() user: any, @Body() body: { token?: string; backupCode?: string }) {
    const { token, backupCode } = body;

    if (!token && !backupCode) {
      throw new UnauthorizedException('Please provide a 2FA code or backup code');
    }

    // Verify with TOTP token
    if (token) {
      if (!user.twoFactorSecret) {
        throw new UnauthorizedException('2FA is not enabled on this account');
      }

      const isValid = this.twoFactorService.verifyToken(user.twoFactorSecret, token);
      if (!isValid) {
        throw new UnauthorizedException('Invalid 2FA code');
      }

      return { message: '2FA verified successfully' };
    }

    // Verify with backup code
    if (backupCode) {
      const isValid = await this.twoFactorService.verifyBackupCode(user.id, backupCode);
      if (!isValid) {
        throw new UnauthorizedException('Invalid backup code');
      }

      return { 
        message: '2FA verified successfully',
        warning: 'Backup code has been used and is no longer valid',
      };
    }

    throw new UnauthorizedException('Verification failed');
  }

  @UseGuards(JwtGuard)
  @Post('2fa/disable')
  async disable2FA(@GetUser() user: any, @Body('password') password: string) {
    // Verify password before disabling
    const isPasswordValid = await this.authService.verifyPassword(user.id, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    await this.twoFactorService.disable2FA(user.id);

    return { message: '2FA has been disabled' };
  }

  @UseGuards(JwtGuard)
  @Get('2fa/status')
  async get2FAStatus(@GetUser() user: any) {
    const is2FAEnabled = await this.twoFactorService.is2FAEnabled(user.id);
    const backupCodesCount = user.twoFactorBackupCodes?.length ?? 0;

    return {
      enabled: is2FAEnabled,
      backupCodesRemaining: backupCodesCount,
      canEnable: user.role === 'ADMIN',
    };
  }
}
