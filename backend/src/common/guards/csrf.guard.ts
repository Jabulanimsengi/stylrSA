import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { createHmac, randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CsrfGuard implements CanActivate {
  private readonly CSRF_COOKIE_NAME = 'csrf_token';
  private readonly CSRF_HEADER_NAME = 'x-csrf-token';
  private readonly secret: string;

  constructor(private configService: ConfigService) {
    // Use JWT_SECRET or a dedicated CSRF secret
    this.secret = this.configService.get<string>('JWT_SECRET') ?? 'csrf-secret-key';
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const method = request.method;

    // Only check CSRF for state-changing methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      // For safe methods, just ensure cookie exists (create if not)
      this.ensureCsrfCookie(request, response);
      return true;
    }

    // For unsafe methods (POST, PUT, DELETE, PATCH), validate token
    const cookieToken = request.cookies?.[this.CSRF_COOKIE_NAME];
    const headerToken = request.headers[this.CSRF_HEADER_NAME] as string;

    if (!cookieToken || !headerToken) {
      throw new ForbiddenException('CSRF token missing');
    }

    // Verify both tokens match and are valid
    if (!this.verifyToken(cookieToken) || cookieToken !== headerToken) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }

  /**
   * Ensure CSRF cookie exists, create if not
   */
  private ensureCsrfCookie(request: Request, response: Response): void {
    const existingToken = request.cookies?.[this.CSRF_COOKIE_NAME];

    if (existingToken && this.verifyToken(existingToken)) {
      // Valid token exists, no action needed
      return;
    }

    // Generate new token
    const newToken = this.generateToken();

    // Set cookie
    response.cookie(this.CSRF_COOKIE_NAME, newToken, {
      httpOnly: false, // Must be readable by JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      path: '/',
    });
  }

  /**
   * Generate a new CSRF token
   */
  private generateToken(): string {
    const randomValue = randomBytes(32).toString('hex');
    const timestamp = Date.now().toString();
    const data = `${randomValue}.${timestamp}`;
    
    // Create HMAC signature
    const signature = this.createSignature(data);
    
    return `${data}.${signature}`;
  }

  /**
   * Verify a CSRF token
   */
  private verifyToken(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return false;
      }

      const [randomValue, timestamp, signature] = parts;
      const data = `${randomValue}.${timestamp}`;

      // Verify signature
      const expectedSignature = this.createSignature(data);
      if (signature !== expectedSignature) {
        return false;
      }

      // Check if token is not expired (24 hours)
      const tokenTime = parseInt(timestamp, 10);
      const now = Date.now();
      const maxAge = 1000 * 60 * 60 * 24; // 24 hours

      if (now - tokenTime > maxAge) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create HMAC signature for data
   */
  private createSignature(data: string): string {
    return createHmac('sha256', this.secret)
      .update(data)
      .digest('hex');
  }
}
