import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ErrorHandler } from './error/classes/errorHandler';
// import { SetAuthCookiesInterceptor } from './auth/interceptors/cookie-interceptor';
// import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const errorHandler = new ErrorHandler();
  // const configService = app.get(ConfigService);

  //CORS
  app.enableCors();
  app.enableCors({});

  //Global Prefix
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const arrayOfErrors: string[] = [];
        errors.map((error) => {
          const errorsArray = Object.entries(error.constraints ?? {}).map(
            ([_, msg]) => {
              arrayOfErrors.push(msg);
              return;
            },
          );

          return errorsArray;
        });

        // return errorHandler.handleError(new BadRequestException(arrayOfErrors));
        return errorHandler.handleError({
          status: 400,
          message: arrayOfErrors,
        });
      },
    }),
  );

  // app.useGlobalInterceptors(new SetAuthCookiesInterceptor(configService));

  //Cookie Parser
  app.use(cookieParser());

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
