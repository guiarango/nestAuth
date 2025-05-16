import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ValidAreas, ValidRoles } from '../interfaces';

export class CreateUserDto {
  @IsString({ message: 'El email debe ser un string' })
  @IsEmail({}, { message: 'El email no es valido' })
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: 'El email no es valido',
  })
  @Transform(({ value }) => value.trim().toLowerCase())
  email: string;

  @IsString({ message: 'La clave debe ser un string' })
  @MinLength(6, { message: 'La clave debe tener mínimo 6 caracteres' })
  @MaxLength(30, { message: 'La clave debe tener máximo 30 caracteres' })
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'La clave debe tener una mayuscula, una minuscula, un numero y mínimo 6 caracteres',
  })
  password: string;

  @IsString({ message: 'El nombre debe ser un string' })
  @Transform(({ value }) => value.trim().toLowerCase())
  @MinLength(1, { message: 'La clave debe tener mínimo 1 caracteres' })
  @MaxLength(50, { message: 'La clave debe tener máximo 50 caracteres' })
  names: string;

  @IsString({ message: 'El apellido debe ser un string' })
  @Transform(({ value }) => value.trim().toLowerCase())
  @MinLength(1, { message: 'La clave debe tener mínimo 1 caracteres' })
  @MaxLength(50, { message: 'La clave debe tener máximo 50 caracteres' })
  lastNames: string;

  @IsString({ message: 'La cédula debe ser un string' })
  @Transform(({ value }) => value.trim())
  @MinLength(4, { message: 'La clave debe tener mínimo 4 caracteres' })
  @MaxLength(15, { message: 'La clave debe tener máximo 15 caracteres' })
  userDocument: string;

  @IsBoolean({ message: 'El campo isActive debe ser un booleano' })
  isActive: boolean;

  @IsArray({ message: 'El rol debe ser un array' })
  @ArrayMinSize(2, { message: 'El rol debe tener al menos un item' })
  @IsEnum(ValidRoles, {
    each: true,
    message: `El rol debe ser uno de los siguientes: ${JSON.stringify(
      ValidRoles,
    )}`,
  })
  @Transform(({ value }) => {
    return [ValidRoles.user, ...value];
  })
  roles: string[];

  @IsArray({ message: 'El área debe ser un array' })
  @ArrayMinSize(2, { message: 'El área debe tener al menos un item' })
  @IsEnum(ValidAreas, {
    each: true,
    message: `El área debe ser una de las siguientes: ${JSON.stringify(
      ValidAreas,
    )}`,
  })
  @Transform(({ value }) => {
    return [ValidAreas.company, ...value];
  })
  areas: string[];

  //   file?: Express.Multer.File;
}
