import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { ExtractJwt } from 'passport-jwt';

import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RefreshToken } from '../entities';
import { JwtClass } from '../classes';
import { Reflector } from '@nestjs/core';

@Injectable()
export class UserAuthGuard implements CanActivate {
  constructor(
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshToken>,
    private readonly configService: ConfigService,
    private jwt: JwtClass,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const { token, refreshTokenId } = req.cookies;

    const secret = this.configService.get<string>('JWT_SECRET');

    //secret doesn't exist

    if (!secret) {
      throw new BadRequestException('JWT secret not configured');
    }

    //refresh token id does not exist
    if (!refreshTokenId) {
      throw new UnauthorizedException('Refresh token id not found');
    }

    try {
      const decoded = jwt.verify(token, secret);

      const isActive = (decoded as { isActive: boolean }).isActive;
      const userDocument = (decoded as { userDocument: string }).userDocument;

      //user is not active
      if (!isActive) {
        throw new UnauthorizedException('JWT secret not configured');
      }

      req.user = { userDocument };

      return true;
    } catch (error: any) {
      //if token is expired continue with refresh token
    }

    //-----------------Validates the refreshTokenId-----------------
    const refreshToken = await this.refreshTokenModel.findById(refreshTokenId);

    //refresh token does not exist
    if (!refreshToken) {
      throw new UnauthorizedException('refreshToken not found');
    }

    try {
      const decodedRefreshToken = jwt.verify(refreshToken.token, secret);

      const areas = (decodedRefreshToken as { areas: string[] }).areas;
      const isActive = (decodedRefreshToken as { isActive: boolean }).isActive;
      const roles = (decodedRefreshToken as { roles: string[] }).roles;
      const userDocument = (decodedRefreshToken as { userDocument: string })
        .userDocument;

      //user is not active
      if (!isActive) {
        throw new UnauthorizedException('JWT secret not configured');
      }

      //Generates the new tokens
      const { token, refreshToken: newRefreshTokenId } =
        this.jwt.generateTokens({
          userDocument,
          roles,
          areas,
          isActive,
        });

      const today = new Date();
      const expiresAt = refreshToken.get('expiresAt');
      const hoursUntilExpiration =
        (expiresAt.getTime() - today.getTime()) / (1000 * 60 * 60);
      const timeToRefresh = Number(
        this.configService.get('JWT_TIME_TO_REFRESH_TOKEN') || 18,
      );

      //If JWT_TIME_TO_REFRESH_TOKEN has passed, then refreshtokenmodel

      if (hoursUntilExpiration <= timeToRefresh) {
        const refreshTokenExp = new Date(
          Date.now() +
            Number(
              this.configService.get('JWT_REFRESH_TOKEN_EXPIRY') || 86400000,
            ),
        );
        const payload = {
          userDocument,
          token: newRefreshTokenId,
          expiresAt: refreshTokenExp,
        };

        //Creates new refresh token on the db
        await this.refreshTokenModel.findOneAndUpdate(
          { _id: refreshTokenId },
          payload,
        );
        req.user = { userDocument, newToken: token, refreshTokenExp };
        return true;
      }

      req.user = { userDocument, newToken: token };

      return true;
    } catch (error) {
      throw new UnauthorizedException('user not authorized');
    }
  }
}
