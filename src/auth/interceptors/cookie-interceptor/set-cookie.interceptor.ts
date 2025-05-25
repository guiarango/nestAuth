import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class SetCookieInterceptor implements NestInterceptor {
  constructor(private configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((info) => {
        const data = info.data;

        const nodeENV = this.configService.get('NODE_ENV');

        if (data.token) {
          const token = data.token;

          response.cookie('token', token, {
            httpOnly: true,
            secure: nodeENV === 'production' ? true : false,
            sameSite: 'lax',
            maxAge: parseInt(
              this.configService.get('JWT_TOKEN_EXPIRY') || '900000',
            ), // 15 min
          });
        }

        if (data.refreshTokenId) {
          response.cookie('refreshTokenId', data.refreshTokenId, {
            httpOnly: true,
            secure: nodeENV === 'production' ? true : false,
            sameSite: 'lax',
            path: '/',
            maxAge: parseInt(
              this.configService.get('JWT_REFRESH_TOKEN_EXPIRY') || '86400000',
            ), // 1 days
          });
        }
        return data;
      }),
    );
  }
}
