import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { randomBytes, createHmac } from 'crypto';
import { ConfigService } from '@nestjs/config';

@Controller('api/csrf')
export class CsrfController {
  private readonly CSRF_COOKIE_NAME = 'csrf_token';
  private readonly secret: string;

  constructor(private configService: ConfigService) {
    this.secret = this.configService.get<string>('JWT_SECRET') ?? 'csrf-secret-key';
  }

  @Get('token')
  getCsrfToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // Check if valid token already exists
    const existingToken = req.cookies?.[this.CSRF_COOKIE_NAME];
    
    if (existingToken && this.verifyToken(existingToken)) {
      return { csrfToken: existingToken };
    }

    // Generate new token
    const token = this.generateToken();

    // Set cookie
    res.cookie(this.CSRF_COOKIE_NAME, token, {
      httpOnly: false, // Must be readable by JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      path: '/',
    });

    return { csrfToken: token };
  }

  private generateToken(): string {
    const randomValue = randomBytes(32).toString('hex');
    const timestamp = Date.now().toString();
    const data = `${randomValue}.${timestamp}`;
    
    const signature = createHmac('sha256', this.secret)
      .update(data)
      .digest('hex');
    
    return `${data}.${signature}`;
  }

  private verifyToken(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return false;
      }

      const [randomValue, timestamp, signature] = parts;
      const data = `${randomValue}.${timestamp}`;

      const expectedSignature = createHmac('sha256', this.secret)
        .update(data)
        .digest('hex');
        
      if (signature !== expectedSignature) {
        return false;
      }

      const tokenTime = parseInt(timestamp, 10);
      const now = Date.now();
      const maxAge = 1000 * 60 * 60 * 24;

      return (now - tokenTime) <= maxAge;
    } catch {
      return false;
    }
  }
}
