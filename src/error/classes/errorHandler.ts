import { MongoServerError } from 'mongodb';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JsonResponse } from '../../common/interfaces/jsonResponse.interface';

@Injectable()
export class ErrorHandler {
  handleError(error: any): JsonResponse<null> {
    if (error instanceof MongoServerError) {
      throw new BadRequestException({
        data: null,
        errors: error.errorResponse.errmsg
          ? [error.errorResponse.errmsg]
          : null,
        ok: false,
        statusCode: 400,
      });
    }

    const errors = {
      data: null,
      errors: error.message || null,
      ok: false,
      statusCode: error.status || 500,
    };

    if (error.status === 400) {
      throw new BadRequestException(errors);
    }

    if (error.status === 401) {
      throw new UnauthorizedException(errors);
    }

    if (error.status === 403) {
      throw new ForbiddenException(errors);
    }

    if (error.status === 404) {
      throw new NotFoundException(errors);
    }

    throw new InternalServerErrorException(errors);
  }
}
