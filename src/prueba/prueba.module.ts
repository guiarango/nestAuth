import { Module } from '@nestjs/common';
import { PruebaService } from './prueba.service';
import { PruebaController } from './prueba.controller';

@Module({
  controllers: [PruebaController],
  providers: [PruebaService],
})
export class PruebaModule {}
