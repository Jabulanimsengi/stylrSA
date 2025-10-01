import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto';
import * as argon from 'argon2';
import * as bcrypt from 'bcrypt';
import { Prisma, UserRole } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: RegisterDto) {
    const hash = await argon.hash(dto.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: dto.role || UserRole.CLIENT,
        },
      });
      return this.signToken(user.id, user.email, user.role);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ForbiddenException('Credentials taken');
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new ForbiddenException('Credentials incorrect');

    let pwMatches = false;
    try {
      // First, try verifying with Argon2
      pwMatches = await argon.verify(user.password, dto.password);
    } catch (argonError) {
      // If Argon2 verification fails (e.g., hash is not an Argon2 hash),
      // check if it's a bcrypt hash and try that.
      try {
        pwMatches = await bcrypt.compare(dto.password, user.password);
        
        // If bcrypt verification is successful, we should re-hash the password
        // with Argon2 and update it in the database for future logins.
        if (pwMatches) {
          const newHash = await argon.hash(dto.password);
          await this.prisma.user.update({
            where: { id: user.id },
            data: { password: newHash },
          });
        }
      } catch (bcryptError) {
        // If both fail, the password is truly incorrect.
        pwMatches = false;
      }
    }

    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

    return this.signToken(user.id, user.email, user.role);
  }

  async signToken(
    userId: string,
    email: string,
    role: string,
  ): Promise<{ accessToken: string }> {
    const payload = { sub: userId, email, role };
    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '24h',
      secret: secret,
    });
    return { accessToken: token };
  }
}