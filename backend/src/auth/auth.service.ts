import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto';
import * as argon2 from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    // generate the password hash
    const hash = await argon2.hash(dto.password);
    // save the new user in the db
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hash, // Changed from 'hash' to 'password' to match your schema
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: dto.role,
        },
      });

      // Return a success message or sign a token, depending on desired flow
      return { message: 'User registered successfully' };

    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    // find the user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
      include: { salons: true },
    });
    // if user does not exist throw exception
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // compare password using argon2
    const pwMatches = await argon2.verify(user.password, dto.password);
    // if password incorrect throw exception
    if (!pwMatches) throw new UnauthorizedException('Invalid credentials');
    
    const salon = user.salons && user.salons.length > 0 ? user.salons[0] : null;

    const accessToken = await this.signToken(user.id, user.email, user.role);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        salonId: salon?.id,
      },
    };
  }
  
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
    });

    if (!user) {
        return { message: 'If your email is in our database, you will receive a password reset link.' };
    }

    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await this.prisma.user.update({
        where: { id: user.id },
        data: {
            resetPasswordToken: resetToken,
            resetPasswordExpires: resetTokenExpiry,
        },
    });

    console.log(`Password reset token for ${user.email}: ${resetToken}`);

    return { message: 'Password reset email sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
      const user = await this.prisma.user.findFirst({
          where: {
              resetPasswordToken: dto.token,
              resetPasswordExpires: { gt: new Date() },
          },
      });

      if (!user) {
          throw new UnauthorizedException('Invalid or expired password reset token');
      }

      const hashedPassword = await argon2.hash(dto.password);

      await this.prisma.user.update({
          where: { id: user.id },
          data: {
              password: hashedPassword,
              resetPasswordToken: null,
              resetPasswordExpires: null,
          },
      });

      return { message: 'Password has been successfully reset' };
  }

  signToken(userId: string, email: string, role: string): Promise<string> {
    const payload = {
      sub: userId,
      email,
      role,
    };
    const secret = this.config.get('JWT_SECRET');

    return this.jwt.signAsync(payload, {
      expiresIn: '1d',
      secret: secret,
    });
  }
}