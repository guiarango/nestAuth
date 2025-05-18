import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JsonResponse } from '../../common/interfaces/jsonResponse.interface';
// adjust the path accordingly

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, JsonResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<JsonResponse<T>> {
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => ({
        data: data,
        errors: null,
        ok: true,
        statusCode: statusCode,
      })),
    );
  }
}
