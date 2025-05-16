import { Global, Module } from '@nestjs/common';
import { ErrorHandler } from './classes/errorHandler';

@Global()
@Module({
  providers: [ErrorHandler],
  exports: [ErrorHandler],
})
export class ErrorModule {}
