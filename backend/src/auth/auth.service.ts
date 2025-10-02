import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto';
import * as argon from 'argon2';
import * as bcrypt from 'bcrypt';
import { Prisma, User, UserRole } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';

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
      if (user.password.startsWith('$argon2')) {
        pwMatches = await argon.verify(user.password, dto.password);
      } else {
        pwMatches = await bcrypt.compare(dto.password, user.password);
        if (pwMatches) {
          const newHash = await argon.hash(dto.password);
          await this.prisma.user.update({
            where: { id: user.id },
            data: { password: newHash },
          });
        }
      }
    } catch (error) {
      throw new ForbiddenException('Credentials incorrect');
    }

    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

    return this.signToken(user.id, user.email, user.role);
  }

  async forgotPassword(email: string): Promise<{ message: string, token: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('User with that email does not exist');
    }

    const resetToken = randomBytes(32).toString('hex');
    const resetPasswordToken = await argon.hash(resetToken);
    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour from now

    await this.prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken,
        resetPasswordExpires,
      },
    });

    // In a real app, you'd email this token to the user
    console.log(`Password reset token for ${email}: ${resetToken}`);

    return {
      message: 'Password reset token generated.',
      token: resetToken, // For testing purposes, we return the token
    };
  }

  async resetPassword(token: string, newPass: string): Promise<{ accessToken: string }> {
    const users = await this.prisma.user.findMany({
      where: {
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    let userToUpdate: User | null = null;
    for (const user of users) {
      if (user.resetPasswordToken && await argon.verify(user.resetPasswordToken, token)) {
        userToUpdate = user;
        break;
      }
    }

    if (!userToUpdate) {
      throw new ForbiddenException('Password reset token is invalid or has expired');
    }

    const password = await argon.hash(newPass);

    const updatedUser = await this.prisma.user.update({
      where: { id: userToUpdate.id },
      data: {
        password,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return this.signToken(updatedUser.id, updatedUser.email, updatedUser.role);
  }

  async signToken(
    userId: string,
    email: string,
    role: string,
  ): Promise<{ accessToken: string }> {
    const payload = { sub: userId, email, role };
    
    try {
      // The secret is already configured in the JwtModule.
      // We rely on the pre-configured JwtService instance.
      const token = await this.jwt.signAsync(payload, {
        expiresIn: '24h',
      });
      return { accessToken: token };
    } catch (error) {
        console.error('CRITICAL: Error signing token. Ensure JWT_SECRET is set correctly in .env and the auth module.', error);
        throw new InternalServerErrorException('Could not create authentication token.');
    }
  }
}