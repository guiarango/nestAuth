import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import {
  RefreshToken,
  RefreshTokenSchema,
  // SafixToken,
  // SafixTokenSchema,
  User,
  UserSchema,
} from '../auth/entities';
import { UserAuthGuard } from '../auth/guards';
import { SetAuthCookiesInterceptor } from '../auth/interceptors/cookie-interceptor';
// import { ErrorHandler } from '../error/classes/errorHandler';
import { TransformResponseInterceptor } from '../common/interceptors/transform-response.interceptor';
import { AllExceptionsFilter } from '../common/filters/error-handler.filter';

@Global()
@Module({
  providers: [
    { provide: APP_GUARD, useClass: UserAuthGuard },
    { provide: APP_INTERCEPTOR, useClass: SetAuthCookiesInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformResponseInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    // ErrorHandler,
  ],
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
      // { name: SafixToken.name, schema: SafixTokenSchema },
    ]),
  ],
})
export class CoreModule {}
