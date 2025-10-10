// backend/src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { User } from '@prisma/client';

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
    const token =
      (req as unknown as { cookies?: Record<string, string> }).cookies
        ?.access_token ?? null;
    return token && token.length > 0 ? token : null;
  }

  async validate(payload: {
    sub: string;
    role: string;
  }): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (user) {
      // The password should not be returned with the user object
      const { password: _password, ...result } = user;
      return result;
    }
    return null;
  }
}
