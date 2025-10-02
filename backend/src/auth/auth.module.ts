import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy, AnonymousStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    // Use the simple, synchronous register method.
    // This directly uses the environment variable we've confirmed is loaded.
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AnonymousStrategy],
})
export class AuthModule {}