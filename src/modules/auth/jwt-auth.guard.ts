import { ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from 'src/constants';
import { ROLES_KEY } from 'src/utils/decorators/customize';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException('Token is not valid');
    }

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredRoles) {
      const userRoles = user?.role || [];
      const hasRole = requiredRoles.some((role) => userRoles.includes(role));
      if (!hasRole) {
        throw new ForbiddenException('You must have the required role');
      }
    }
  
    return user;
  }  
}
