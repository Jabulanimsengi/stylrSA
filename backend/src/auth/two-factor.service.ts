import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class TwoFactorService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate 2FA secret and QR code for a user
   */
  async generateSecret(userId: string): Promise<{ secret: string; qrCodeUrl: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true, lastName: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const secret = speakeasy.generateSecret({
      name: `The Salon Hub (${user.email})`,
      issuer: 'The Salon Hub',
      length: 32,
    });

    // Generate QR code as data URL
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url as string);

    return {
      secret: secret.base32,
      qrCodeUrl,
    };
  }

  /**
   * Verify a 2FA token
   */
  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps before and after for clock skew
    });
  }

  /**
   * Generate backup codes for 2FA
   */
  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = randomBytes(4).toString('hex').toUpperCase();
      codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`);
    }
    return codes;
  }

  /**
   * Verify a backup code
   */
  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorBackupCodes: true },
    });

    if (!user || !user.twoFactorBackupCodes) {
      return false;
    }

    const codeIndex = user.twoFactorBackupCodes.indexOf(code);
    if (codeIndex === -1) {
      return false;
    }

    // Remove used backup code
    const updatedCodes = [...user.twoFactorBackupCodes];
    updatedCodes.splice(codeIndex, 1);

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorBackupCodes: updatedCodes },
    });

    return true;
  }

  /**
   * Enable 2FA for a user
   */
  async enable2FA(
    userId: string,
    secret: string,
    backupCodes: string[],
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        twoFactorBackupCodes: backupCodes,
      },
    });
  }

  /**
   * Disable 2FA for a user
   */
  async disable2FA(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: [],
      },
    });
  }

  /**
   * Check if user has 2FA enabled
   */
  async is2FAEnabled(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorEnabled: true },
    });

    return user?.twoFactorEnabled ?? false;
  }
}
