import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;
  private fromEmail: string;

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      console.warn('RESEND_API_KEY not configured. Email sending will be disabled.');
      this.resend = null as any;
    } else {
      this.resend = new Resend(apiKey);
    }
    this.fromEmail = this.config.get<string>('FROM_EMAIL') || 'noreply@yourdomain.com';
  }

  async sendVerificationEmail(email: string, token: string, firstName: string) {
    if (!this.resend) {
      console.log(`[DEV] Verification email for ${email}: ${token}`);
      return;
    }

    const verificationUrl = `${this.config.get('FRONTEND_URL') || 'http://localhost:3001'}/verify-email?token=${token}`;

    try {
      console.log(`[EMAIL] Attempting to send verification email to ${email} from ${this.fromEmail}`);
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Verify your email - Stylr SA',
        html: this.getVerificationEmailTemplate(firstName, verificationUrl),
      });
      console.log(`[EMAIL] Verification email sent successfully to ${email}. ID: ${result.data?.id}`);
    } catch (error) {
      console.error('[EMAIL] Failed to send verification email:', error);
      console.error('[EMAIL] Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, firstName: string) {
    if (!this.resend) {
      console.log(`[DEV] Welcome email for ${email}`);
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Welcome to The Salon Hub!',
        html: this.getWelcomeEmailTemplate(firstName),
      });
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  }

  async sendPasswordResetEmail(email: string, token: string, firstName: string) {
    if (!this.resend) {
      console.log(`[DEV] Password reset for ${email}: ${token}`);
      return;
    }

    const resetUrl = `${this.config.get('FRONTEND_URL') || 'http://localhost:3001'}/reset-password?token=${token}`;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Reset your password - The Salon Hub',
        html: this.getPasswordResetTemplate(firstName, resetUrl),
      });
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw error;
    }
  }

  async sendAccountLockedEmail(email: string, firstName: string, unlockTime: Date) {
    if (!this.resend) {
      console.log(`[DEV] Account locked email for ${email}`);
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Account Temporarily Locked - The Salon Hub',
        html: this.getAccountLockedTemplate(firstName, unlockTime),
      });
    } catch (error) {
      console.error('Failed to send account locked email:', error);
    }
  }

  async send2FASetupEmail(email: string, firstName: string) {
    if (!this.resend) {
      console.log(`[DEV] 2FA setup email for ${email}`);
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Two-Factor Authentication Enabled - The Salon Hub',
        html: this.get2FASetupTemplate(firstName),
      });
    } catch (error) {
      console.error('Failed to send 2FA setup email:', error);
    }
  }

  private getVerificationEmailTemplate(firstName: string, verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #43414A; margin: 0; padding: 0; background-color: #f9f6f1; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #F51957 0%, #d4144c 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
            .content { background: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
            .content h2 { color: #43414A; margin-top: 0; font-size: 22px; }
            .content p { color: #4D4952; font-size: 16px; line-height: 1.7; }
            .button { display: inline-block; padding: 14px 32px; background: #F51957; color: white !important; text-decoration: none; border-radius: 8px; margin: 24px 0; font-weight: 600; font-size: 16px; transition: background 0.3s ease; }
            .button:hover { background: #ff2d6f; }
            .link-text { word-break: break-all; color: #F51957; font-size: 14px; background: #ffd1dd; padding: 12px; border-radius: 6px; display: block; margin: 16px 0; }
            .footer { text-align: center; margin-top: 30px; color: #4D4952; font-size: 13px; }
            .footer a { color: #F51957; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ Welcome to Stylr SA!</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <p>Thank you for joining Stylr SA! We're excited to have you on board. To get started, please verify your email address by clicking the button below:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <span class="link-text">${verificationUrl}</span>
              <p style="font-size: 14px; color: #4D4952; margin-top: 24px;">⏱️ This verification link will expire in 24 hours.</p>
              <p style="font-size: 14px; color: #4D4952;">If you didn't create an account, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Stylr SA. All rights reserved.</p>
              <p>Your one-stop platform for discovering and booking salon services.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getWelcomeEmailTemplate(firstName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #43414A; margin: 0; padding: 0; background-color: #f9f6f1; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #F51957 0%, #d4144c 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
            .content { background: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
            .content h2 { color: #43414A; margin-top: 0; font-size: 22px; }
            .content h3 { color: #F51957; font-size: 18px; margin-top: 24px; }
            .content p { color: #4D4952; font-size: 16px; line-height: 1.7; }
            .content ul { color: #4D4952; font-size: 16px; line-height: 1.9; padding-left: 20px; }
            .content li { margin-bottom: 8px; }
            .footer { text-align: center; margin-top: 30px; color: #4D4952; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome Aboard!</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <p>Your email has been verified successfully! You now have full access to Stylr SA.</p>
              <p>Start exploring amazing salon services, book appointments, and connect with top beauty professionals in South Africa.</p>
              <h3>✨ What's Next?</h3>
              <ul>
                <li>🔍 Browse salons and services in your area</li>
                <li>📅 Book your first appointment</li>
                <li>⭐ Leave reviews and share your experiences</li>
                <li>❤️ Save your favorite salons</li>
              </ul>
              <p style="margin-top: 24px;">If you have any questions, feel free to reach out to our support team.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Stylr SA. All rights reserved.</p>
              <p>Your one-stop platform for discovering and booking salon services.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getPasswordResetTemplate(firstName: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #43414A; margin: 0; padding: 0; background-color: #f9f6f1; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #F51957 0%, #d4144c 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
            .content { background: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
            .content h2 { color: #43414A; margin-top: 0; font-size: 22px; }
            .content p { color: #4D4952; font-size: 16px; line-height: 1.7; }
            .button { display: inline-block; padding: 14px 32px; background: #F51957; color: white !important; text-decoration: none; border-radius: 8px; margin: 24px 0; font-weight: 600; font-size: 16px; transition: background 0.3s ease; }
            .button:hover { background: #ff2d6f; }
            .link-text { word-break: break-all; color: #F51957; font-size: 14px; background: #ffd1dd; padding: 12px; border-radius: 6px; display: block; margin: 16px 0; }
            .warning { background: #fff4d6; border-left: 4px solid #b7791f; padding: 16px; border-radius: 6px; margin: 24px 0; }
            .footer { text-align: center; margin-top: 30px; color: #4D4952; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Reset Your Password</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <span class="link-text">${resetUrl}</span>
              <p style="font-size: 14px; color: #4D4952; margin-top: 24px;">⏱️ This link will expire in 1 hour.</p>
              <div class="warning">
                <p style="margin: 0; font-weight: 600; color: #b7791f;">⚠️ Security Notice</p>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #4D4952;">If you didn't request a password reset, please ignore this email and your password will remain unchanged. Consider changing your password if you suspect unauthorized access.</p>
              </div>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Stylr SA. All rights reserved.</p>
              <p>Your one-stop platform for discovering and booking salon services.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getAccountLockedTemplate(firstName: string, unlockTime: Date): string {
    const unlockTimeStr = unlockTime.toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' });
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #43414A; margin: 0; padding: 0; background-color: #f9f6f1; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ffc107 0%, #f9a825 100%); color: #1c1c1e; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
            .content { background: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
            .content h2 { color: #43414A; margin-top: 0; font-size: 22px; }
            .content p { color: #4D4952; font-size: 16px; line-height: 1.7; }
            .unlock-time { background: #fff4d6; border-left: 4px solid #f9a825; padding: 16px; border-radius: 6px; margin: 20px 0; font-weight: 600; color: #b7791f; }
            .security-info { background: #ffd1dd; border-left: 4px solid #F51957; padding: 16px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #4D4952; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Account Temporarily Locked</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <p>Your account has been temporarily locked due to multiple failed login attempts.</p>
              <div class="unlock-time">
                🕒 Your account will be automatically unlocked at:<br>
                ${unlockTimeStr}
              </div>
              <p>This is a security measure to protect your account from unauthorized access.</p>
              <p>Once your account is unlocked, you can:</p>
              <ul style="color: #4D4952; font-size: 16px; line-height: 1.8;">
                <li>Log in with your correct password</li>
                <li>Use the "Forgot Password" option to reset your password</li>
              </ul>
              <div class="security-info">
                <p style="margin: 0; font-weight: 600; color: #F51957;">🚨 Didn't attempt to log in?</p>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #4D4952;">If you didn't try to access your account, please contact our support team immediately. This could indicate unauthorized access attempts.</p>
              </div>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Stylr SA. All rights reserved.</p>
              <p>Your one-stop platform for discovering and booking salon services.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private get2FASetupTemplate(firstName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #43414A; margin: 0; padding: 0; background-color: #f9f6f1; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3ab7a5 0%, #2e9687 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
            .content { background: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
            .content h2 { color: #43414A; margin-top: 0; font-size: 22px; }
            .content p { color: #4D4952; font-size: 16px; line-height: 1.7; }
            .success-box { background: #cdecea; border-left: 4px solid #3ab7a5; padding: 16px; border-radius: 6px; margin: 20px 0; }
            .warning-box { background: #fff4d6; border-left: 4px solid #f9a825; padding: 16px; border-radius: 6px; margin: 20px 0; }
            .security-info { background: #ffd1dd; border-left: 4px solid #F51957; padding: 16px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #4D4952; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Two-Factor Authentication Enabled</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <div class="success-box">
                <p style="margin: 0; font-weight: 600; color: #25776c;">✅ 2FA Successfully Enabled</p>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #25776c;">Your account security has been enhanced!</p>
              </div>
              <p>Two-factor authentication (2FA) has been successfully enabled on your account. Your account is now more secure!</p>
              <p><strong>How it works:</strong></p>
              <ul style="color: #4D4952; font-size: 16px; line-height: 1.8;">
                <li>Each time you log in, you'll need to enter your password</li>
                <li>Then enter a 6-digit verification code from your authenticator app</li>
                <li>This adds an extra layer of protection to your account</li>
              </ul>
              <div class="warning-box">
                <p style="margin: 0; font-weight: 600; color: #b7791f;">⚠️ Important: Save Your Backup Codes</p>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #4D4952;">Keep your backup codes safe! You'll need them if you lose access to your authenticator app. Store them in a secure location.</p>
              </div>
              <div class="security-info">
                <p style="margin: 0; font-weight: 600; color: #F51957;">🚨 Didn't enable 2FA?</p>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #4D4952;">If you didn't enable two-factor authentication, please contact our support team immediately and change your password.</p>
              </div>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Stylr SA. All rights reserved.</p>
              <p>Your one-stop platform for discovering and booking salon services.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
