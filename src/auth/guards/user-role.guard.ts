import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from '../decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[] = this.reflector.get(
      META_ROLES,
      context.getHandler(),
    );

    if (!validRoles || validRoles.length <= 0) return true;

    const req = context.switchToHttp().getRequest();
    const body = req.user;

    console.log('body roles', body);

    const role = body.roles.find((role: string) => {
      return validRoles.includes(role);
    });

    if (role) return true;

    throw new UnauthorizedException(`User needs a valid rol: [${validRoles}]`);
  }
}
