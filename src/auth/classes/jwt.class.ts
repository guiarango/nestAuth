import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../interfaces';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtClass {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  generateTokens(payload: JwtPayload) {
    const token = this.createJwtToken(payload);
    const refreshToken = this.createJwtRefreshToken(payload);

    return { token, refreshToken };
  }

  createJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_TOKEN_EXPIRY'),
    });
  }
  createJwtRefreshToken(payload: JwtPayload) {
    return this.jwtService.sign(payload, {
      expiresIn: +this.configService.get('JWT_REFRESH_TOKEN_EXPIRY'),
    });
  }
}
