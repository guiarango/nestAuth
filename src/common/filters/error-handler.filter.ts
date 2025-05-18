import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { JsonResponse } from '../interfaces/jsonResponse.interface';
// adjust the path

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // default values
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errors: string[] = [];
    let message = 'Unexpected error occurred';

    // Handle HttpException (from NestJS)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        errors = [res];
      } else if (typeof res === 'object' && res !== null && 'message' in res) {
        errors = Array.isArray(res['message'])
          ? res['message']
          : [res['message']];
      }
    }
    // Optionally, add additional error checks (Mongoose errors, CastError, etc.)
    // For example:
    else if (
      typeof exception === 'object' &&
      exception !== null &&
      'name' in exception &&
      exception['name'] === 'ValidationError' &&
      'errors' in exception &&
      typeof exception['errors'] === 'object'
    ) {
      const validationError = exception as {
        errors: Record<string, { message: string }>;
      };
      status = HttpStatus.BAD_REQUEST;
      errors = Object.values(validationError.errors).map((e) => e.message);
      message = 'Mongoose validation failed';
    } else if (
      typeof exception === 'object' &&
      exception !== null &&
      'name' in exception &&
      exception['name'] === 'CastError' &&
      'path' in exception &&
      'value' in exception
    ) {
      const castError = exception as { path: string; value: string };
      status = HttpStatus.BAD_REQUEST;
      errors = [`Invalid ${castError.path}: ${castError.value}`];
      message = 'Invalid identifier';
    }
    // Fallback for custom errors with a message property
    else if (
      typeof exception === 'object' &&
      exception !== null &&
      'message' in exception &&
      typeof exception['message'] === 'string'
    ) {
      errors = [exception['message']];
    }

    response.status(status).json({
      data: null,
      errors,
      ok: false,
      statusCode: status,
    } as JsonResponse<null>);
  }
}
