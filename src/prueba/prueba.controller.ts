import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PruebaService } from './prueba.service';
import { CreatePruebaDto } from './dto/create-prueba.dto';
import { UpdatePruebaDto } from './dto/update-prueba.dto';
import { RolesAreasProtection } from '../auth/decorators';
import { ValidAreas, ValidRoles } from '../auth/interfaces';

@Controller('prueba')
export class PruebaController {
  constructor(private readonly pruebaService: PruebaService) {}

  @RolesAreasProtection({
    areas: [ValidAreas.it],
    roles: [ValidRoles.admin],
  })
  @Post()
  create(@Body() createPruebaDto: CreatePruebaDto) {
    return this.pruebaService.create(createPruebaDto);
  }

  @Get()
  findAll() {
    return this.pruebaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pruebaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePruebaDto: UpdatePruebaDto) {
    return this.pruebaService.update(+id, updatePruebaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pruebaService.remove(+id);
  }
}
