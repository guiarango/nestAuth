import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsString({ message: 'La cédula debe ser un string' })
  @Transform(({ value }) => value.trim())
  @MinLength(4, { message: 'La clave debe tener mínimo 4 caracteres' })
  @MaxLength(15, { message: 'La clave debe tener máximo 15 caracteres' })
  userDocument: string;

  @IsString({ message: 'La clave debe ser un string' })
  password: string;
}
