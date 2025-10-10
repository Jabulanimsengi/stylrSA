import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(
    _err: unknown,
    user: unknown,
    _info?: unknown,
    _context?: unknown,
  ): unknown {
    return user ?? null;
  }
}
