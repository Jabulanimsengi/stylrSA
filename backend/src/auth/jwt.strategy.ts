// backend/src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  private static extractJWT(this: void, req: Request): string | null {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const cookies = (req as unknown as { cookies?: Record<string, string> }).cookies;
    const token = cookies?.access_token ?? null;

    console.log('[JwtStrategy] Extracting JWT...');
    console.log('[JwtStrategy] Cookies object:', JSON.stringify(cookies, null, 2));
    console.log('[JwtStrategy] Raw Cookie Header:', req.headers.cookie);
    console.log('[JwtStrategy] Found token:', token ? 'Yes (hidden)' : 'No');

    return token && token.length > 0 ? token : null;
  }

  async validate(payload: { sub: string; role: string }): Promise<any | null> {
    console.log('[JwtStrategy] Validating JWT payload:', {
      userId: payload.sub,
      roleInToken: payload.role
    });

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (user) {
      // Log role mismatch warning
      if (payload.role && payload.role !== user.role) {
        console.warn('[JwtStrategy] Role mismatch detected!', {
          tokenRole: payload.role,
          dbRole: user.role,
          userId: user.id
        });
      }

      console.log('[JwtStrategy] User validated successfully:', {
        userId: user.id,
        email: user.email,
        role: user.role
      });

      // The password should not be returned with the user object
      const { password: _password, ...result } = user;
      return result;
    }

    console.warn('[JwtStrategy] User not found for JWT payload:', payload.sub);
    return null;
  }
}
