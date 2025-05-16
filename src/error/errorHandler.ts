import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JsonResponse } from '../common/interfaces/jsonResponse.interface';

export class ErrorHandler {
  genericError: JsonResponse<null> = {
    data: null,
    errors: [],
    ok: false,
    statusCode: 500,
  };

  handleError(error: any): JsonResponse<null> {
    const response = error.getResponse() as {
      message?: string[];
      statusCode?: number;
    };

    return {
      data: null,
      errors: response.message || null,
      ok: false,
      statusCode: response.statusCode || 500,
    };
  }
}
