import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

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
    const { user } = context.switchToHttp().getRequest();

    // If no user (not authenticated yet), AuthGuard should have failed before,
    // but good to check.
    if (!user) return false;

    // Check if user has one of the required roles
    // user.role is expected to be 'ADMIN' | 'USER' | 'STAFF' etc.
    return requiredRoles.some((role) => user.role === role);
  }
}
