import { IsOptional, IsString } from 'class-validator';

export class AuthMeDto {
  @IsString()
  @IsOptional()
  token?: string | undefined;

  @IsString({ message: 'Debe proporcionar un refreshTokenId' })
  refreshTokenId: string;
}
