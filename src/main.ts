import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
// import { SetAuthCookiesInterceptor } from './auth/interceptors/cookie-interceptor';
// import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
    }),
  );

  //Cookie Parser
  app.use(cookieParser());

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
