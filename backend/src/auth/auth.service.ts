import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto';
import * as argon2 from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { randomBytes } from 'crypto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      // If user exists but email is not verified
      if (!existingUser.emailVerified) {
        // Check if verification token has expired
        const isExpired = existingUser.verificationExpires && existingUser.verificationExpires < new Date();
        
        if (isExpired) {
          // Generate new verification token
          const verificationToken = randomBytes(32).toString('hex');
          const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

          await this.prisma.user.update({
            where: { id: existingUser.id },
            data: {
              verificationToken,
              verificationExpires,
            },
          });

          // Resend verification email
          await this.mailService.sendVerificationEmail(
            existingUser.email,
            verificationToken,
            existingUser.firstName,
          );

          return {
            message: 'Account already exists but not verified. A new verification email has been sent.',
            requiresVerification: true,
            isExisting: true,
          };
        } else {
          // Token is still valid, just resend with existing token
          await this.mailService.sendVerificationEmail(
            existingUser.email,
            existingUser.verificationToken!,
            existingUser.firstName,
          );

          return {
            message: 'Account already exists but not verified. Verification email has been resent.',
            requiresVerification: true,
            isExisting: true,
          };
        }
      } else {
        // User exists and is verified
        throw new ForbiddenException('Email already registered. Please log in.');
      }
    }

    // generate the password hash
    const hash = await argon2.hash(dto.password);
    
    // Generate email verification token
    const verificationToken = randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // save the new user in the db
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: dto.role,
          verificationToken,
          verificationExpires,
          emailVerified: false,
        },
      });

      // Send verification email
      await this.mailService.sendVerificationEmail(
        user.email,
        verificationToken,
        user.firstName,
      );

      return { 
        message: 'Registration successful! Please check your email to verify your account.',
        requiresVerification: true,
        isExisting: false,
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email already registered');
        }
      }
      console.error('[AUTH] Registration error:', error);
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

    // Check if account is locked
    if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      const unlockTime = user.accountLockedUntil.toLocaleString('en-ZA', { 
        timeZone: 'Africa/Johannesburg' 
      });
      throw new UnauthorizedException(
        `Account locked due to multiple failed login attempts. Try again after ${unlockTime}`
      );
    }

    // compare password using argon2
    const pwMatches = await argon2.verify(user.password, dto.password);
    
    // if password incorrect, increment failed attempts
    if (!pwMatches) {
      const failedAttempts = user.failedLoginAttempts + 1;
      const updateData: any = { failedLoginAttempts: failedAttempts };
      
      // Lock account after 5 failed attempts (15 minutes)
      if (failedAttempts >= 5) {
        const lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        updateData.accountLockedUntil = lockUntil;
        updateData.failedLoginAttempts = 0; // Reset counter
        
        await this.prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });
        
        // Send account locked email
        await this.mailService.sendAccountLockedEmail(
          user.email,
          user.firstName,
          lockUntil,
        );
        
        throw new UnauthorizedException(
          'Account locked due to multiple failed login attempts. Check your email for details.'
        );
      }
      
      await this.prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
      
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in. Check your inbox for the verification link.'
      );
    }

    // Reset failed login attempts on successful login
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        accountLockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    const salon = user.salons && user.salons.length > 0 ? user.salons[0] : null;
    const accessToken = await this.signToken(user.id, user.email, user.role);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        salonId: salon?.id,
        emailVerified: user.emailVerified,
      },
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      return {
        message:
          'If your email is in our database, you will receive a password reset link.',
      };
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

    // Send password reset email
    await this.mailService.sendPasswordResetEmail(
      user.email,
      resetToken,
      user.firstName,
    );

    return { message: 'If your email is in our database, you will receive a password reset link.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: dto.token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Invalid or expired password reset token',
      );
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

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Invalid or expired verification token',
      );
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationExpires: null,
      },
    });

    // Send welcome email
    await this.mailService.sendWelcomeEmail(user.email, user.firstName);

    return { message: 'Email verified successfully! You can now log in.' };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.emailVerified) {
      throw new ForbiddenException('Email already verified');
    }

    // Generate new verification token
    const verificationToken = randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationExpires,
      },
    });

    await this.mailService.sendVerificationEmail(
      user.email,
      verificationToken,
      user.firstName,
    );

    return { message: 'Verification email sent. Please check your inbox.' };
  }

  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      return false;
    }

    return argon2.verify(user.password, password);
  }

  signToken(userId: string, email: string, role: string): Promise<string> {
    const payload = {
      sub: userId,
      email,
      role,
    };
    const secret = this.config.get<string>('JWT_SECRET') ?? '';

    return this.jwt.signAsync(payload, {
      expiresIn: '1d',
      secret: secret,
    });
  }

  async sso(body: {
    provider: string;
    providerAccountId: string;
    email?: string | null;
    name?: string | null;
    role?: string | null;
  }) {
    const { provider, providerAccountId, email, name, role } = body;
    if (!provider || !providerAccountId) {
      throw new UnauthorizedException('Invalid SSO payload');
    }

    // Try to find existing OAuth account
    let user = await this.prisma.user.findFirst({
      where: {
        oauthAccounts: {
          some: { provider, providerAccountId },
        },
      },
    });

    // If not found, try link by email
    if (!user && email) {
      user = await this.prisma.user.findUnique({ where: { email } });
      if (user) {
        // Check if email is verified before linking OAuth account
        if (!user.emailVerified) {
          throw new UnauthorizedException(
            'Please verify your email address before using OAuth login. Check your inbox for the verification link.'
          );
        }
        
        await this.prisma.oAuthAccount.create({
          data: {
            userId: user.id,
            provider,
            providerAccountId,
          },
        });
      }
    }

    // If still no user, create a new one
    if (!user) {
      const fullName = (name ?? '').trim();
      const [firstName, ...rest] = fullName ? fullName.split(' ') : ['User'];
      const lastName = rest.join(' ') || 'Account';
      const tempPassword = randomBytes(16).toString('hex');
      const passwordHash = await argon2.hash(tempPassword);
      
      // Validate role or default to CLIENT
      const validRoles = ['CLIENT', 'SALON_OWNER', 'PRODUCT_SELLER'];
      const userRole = role && validRoles.includes(role) ? role : 'CLIENT';
      
      user = await this.prisma.user.create({
        data: {
          email: email ?? `${provider}-${providerAccountId}@example.local`,
          password: passwordHash,
          firstName,
          lastName,
          role: userRole as any,
          emailVerified: true, // OAuth accounts are pre-verified
          oauthAccounts: {
            create: { provider, providerAccountId },
          },
        },
      });
    }

    // Final check: ensure user email is verified before issuing token
    if (!user.emailVerified) {
      throw new UnauthorizedException(
        'Please verify your email address before logging in. Check your inbox for the verification link.'
      );
    }

    const accessToken = await this.signToken(user.id, user.email, user.role);
    const salon = await this.prisma.salon.findFirst({
      where: { ownerId: user.id },
      select: { id: true },
    });
    return {
      jwt: accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        salonId: salon?.id,
      },
    };
  }
}
