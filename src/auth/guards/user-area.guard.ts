import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ErrorHandler } from '../../error/classes/errorHandler';
import { META_AREAS } from '../decorators/area-protected.decorator';

@Injectable()
export class UserAreaGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly errorHandler: ErrorHandler,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validAreas: string[] = this.reflector.get(
      META_AREAS,
      context.getHandler(),
    );

    if (!validAreas || validAreas.length <= 0) return true;

    const req = context.switchToHttp().getRequest();

    const body = req.user;

    const area = body.areas.find((area: string) => {
      return validAreas.includes(area);
    });

    if (area) return true;

    throw this.errorHandler.handleError({
      status: 401,
      message: [`User needs a valid area: [${validAreas}]`],
    });
  }
}
