import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { Strategy as AnonymousStrategyPassport } from 'passport-anonymous';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    // Read the secret directly from the verified process environment.
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      // This error will crash the app on start if the secret is missing, which is a good failsafe.
      throw new Error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: { sub: string; email: string }) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException();
    }
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException();
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }
}

@Injectable()
export class AnonymousStrategy extends PassportStrategy(AnonymousStrategyPassport, 'anonymous') {
    constructor() {
        super();
    }

    async validate(): Promise<any> {
      return null;
    }
}