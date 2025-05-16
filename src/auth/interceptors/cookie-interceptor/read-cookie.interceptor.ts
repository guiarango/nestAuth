import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ReadCookieInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    const cookies = request.cookies;

    if (!cookies || !cookies.refreshToken || !cookies.refreshTokenId) {
      throw new UnauthorizedException('Missing refresh tokens cookies');
    }

    return next.handle();
  }
}
