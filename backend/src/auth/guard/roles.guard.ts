// backend/src/auth/guard/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const req = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const role = req.user?.role;
    const userId = req.user?.id;
    
    console.log('[RolesGuard] Authorization check:', {
      requiredRoles,
      userRole: role,
      userId,
      hasUser: !!req.user,
      endpoint: req.url
    });
    
    if (!role) {
      console.warn('[RolesGuard] Access denied - no role found on user object');
      return false;
    }
    
    const hasAccess = requiredRoles.includes(String(role));
    
    if (!hasAccess) {
      console.warn('[RolesGuard] Access denied - role mismatch:', {
        userRole: role,
        requiredRoles
      });
    } else {
      console.log('[RolesGuard] Access granted');
    }
    
    return hasAccess;
  }
}
