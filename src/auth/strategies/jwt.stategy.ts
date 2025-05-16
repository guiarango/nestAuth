import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

import { Strategy, ExtractJwt } from 'passport-jwt';
import { Model } from 'mongoose';
import { Request } from 'express';

import { JwtPayload } from '../interfaces';
import { RefreshToken } from '../entities';
import { ErrorHandler } from '../../error/classes/errorHandler';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshToken>,
    private readonly errorHandler: ErrorHandler,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.token;
        },
      ]),
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<Boolean> {
    //if token is not valid
    if (!payload) {
      this.errorHandler.handleError({
        status: 401,
        message: ['Invalid token'],
      });
    }

    const { userDocument, roles, areas } = payload;

    //if token is expired
    // if (exp! > Date.now()) {
    //   return true;
    // }

    //return refresh token
    try {
      const refreshToken = await this.refreshTokenModel.findOne({
        userDocument,
      });

      //if refresh token is not found
      if (!refreshToken) {
        this.errorHandler.handleError({
          status: 401,
          message: ['Invalid refresh token'],
        });
      }

      // const token = refreshToken!;
      // if (Date.parse(token.expiresAt) > Date.now()) {
      //   return true;
      // }

      return true;
    } catch (error) {
      this.errorHandler.handleError(error);
    }

    return true;
  }
}
