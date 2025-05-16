import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class SetAuthCookiesInterceptor implements NestInterceptor {
  constructor(private configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const res = ctx.getResponse();

    return next.handle().pipe(
      tap(() => {
        if (res.locals.newAccessToken) {
          res.cookie('token', res.locals.newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: parseInt(
              this.configService.get('JWT_TOKEN_EXPIRY') || '900000',
            ), // 15 min
          });
        }

        // if (res.locals.newRefreshTokenId) {
        //   res.cookie('refreshTokenId', res.locals.newRefreshTokenId, {
        //     httpOnly: true,
        //     secure: true,
        //     sameSite: 'lax',
        //     maxAge: parseInt(
        //       this.configService.get('JWT_REFRESH_TOKEN_EXPIRY') || '86400000',
        //     ), // 1 days
        //   });
        // }
      }),
    );
  }
}
