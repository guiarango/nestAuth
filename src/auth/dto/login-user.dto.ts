import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ValidAreas, ValidRoles } from '../interfaces';

export class LoginUserDto {
  @IsString({ message: 'La cédula debe ser un string' })
  @Transform(({ value }) => value.trim())
  @MinLength(4, { message: 'La clave debe tener mínimo 4 caracteres' })
  @MaxLength(15, { message: 'La clave debe tener máximo 15 caracteres' })
  userDocument: string;

  @IsString({ message: 'La clave debe ser un string' })
  // @MinLength(6, { message: 'La clave debe tener mínimo 6 caracteres' })
  // @MaxLength(30, { message: 'La clave debe tener máximo 30 caracteres' })
  // @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
  //   message:
  //     'La clave debe tener una mayuscula, una minuscula, un numero y mínimo 6 caracteres',
  // })
  password: string;
}
