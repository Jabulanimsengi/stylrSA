// Rate limiting guard for API endpoints
import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// Rate limit configuration
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
}

// Decorator to set rate limit configuration
export const RateLimit = (config: RateLimitConfig) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      // Method decorator
      Reflect.defineMetadata('rateLimit', config, descriptor.value);
    } else {
      // Class decorator
      Reflect.defineMetadata('rateLimit', config, target);
    }
  };
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  private store: RateLimitStore = {};

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Get rate limit configuration from metadata
    const rateLimitConfig = this.reflector.getAllAndOverride<RateLimitConfig>('rateLimit', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!rateLimitConfig) {
      return true; // No rate limit configured
    }

    const { maxRequests, windowMs, keyGenerator } = rateLimitConfig;
    
    // Generate key for this request
    const key = keyGenerator ? keyGenerator(request) : this.getDefaultKey(request);
    
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old entries
    this.cleanupExpiredEntries(windowStart);

    // Get or create rate limit entry
    let entry = this.store[key];
    if (!entry || entry.resetTime <= now) {
      entry = {
        count: 0,
        resetTime: now + windowMs
      };
      this.store[key] = entry;
    }

    // Check if limit exceeded
    if (entry.count >= maxRequests) {
      const resetTimeSeconds = Math.ceil((entry.resetTime - now) / 1000);
      throw new HttpException({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too many requests',
        error: 'Rate Limit Exceeded',
        retryAfter: resetTimeSeconds
      }, HttpStatus.TOO_MANY_REQUESTS);
    }

    // Increment counter
    entry.count++;

    return true;
  }

  private getDefaultKey(request: Request): string {
    // Use IP address and user ID (if available) as key
    const ip = request.ip || request.connection.remoteAddress || 'unknown';
    const userId = (request as any).user?.id || 'anonymous';
    return `${ip}:${userId}`;
  }

  private cleanupExpiredEntries(windowStart: number): void {
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of Object.entries(this.store)) {
      if (entry.resetTime <= windowStart) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => delete this.store[key]);
  }
}

// Pre-configured rate limit decorators for common use cases
export const FileUploadRateLimit = () => RateLimit({
  maxRequests: 10, // 10 uploads
  windowMs: 60 * 1000, // per minute
  keyGenerator: (req) => {
    const ip = req.ip || 'unknown';
    const userId = (req as any).user?.id || 'anonymous';
    return `upload:${ip}:${userId}`;
  }
});

export const AuthRateLimit = () => RateLimit({
  maxRequests: 5, // 5 attempts
  windowMs: 15 * 60 * 1000, // per 15 minutes
  keyGenerator: (req) => {
    const ip = req.ip || 'unknown';
    return `auth:${ip}`;
  }
});

export const APIRateLimit = () => RateLimit({
  maxRequests: 100, // 100 requests
  windowMs: 60 * 1000, // per minute
  keyGenerator: (req) => {
    const ip = req.ip || 'unknown';
    const userId = (req as any).user?.id || 'anonymous';
    return `api:${ip}:${userId}`;
  }
});