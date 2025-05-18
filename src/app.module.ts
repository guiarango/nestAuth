import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { CommonModule } from './common/common.module';
import { EnvConfiguration } from './config/env.config';
import { JoiVaildationSchema } from './config/joi.validation';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from './core/core.module';
import { PruebaModule } from './prueba/prueba.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      // envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      envFilePath: `.env`,
      isGlobal: true,
      load: [EnvConfiguration],
      validationSchema: JoiVaildationSchema,
    }),
    MongooseModule.forRoot(`${process.env.MONGO_DB}`),
    CoreModule,
    CommonModule,
    AuthModule,
    PruebaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
