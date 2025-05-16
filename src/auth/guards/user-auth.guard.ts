import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { ExtractJwt } from 'passport-jwt';

import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorHandler } from '../../error/classes/errorHandler';
import { RefreshToken } from '../entities';
import { JwtClass } from '../classes';
import { Reflector } from '@nestjs/core';

@Injectable()
export class UserAuthGuard implements CanActivate {
  constructor(
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshToken>,
    private readonly configService: ConfigService,
    private readonly errorHandler: ErrorHandler,
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
    const res: Response = context.switchToHttp().getResponse();

    const token = ExtractJwt.fromExtractors([
      (request: Request) => {
        return request?.cookies?.token || null;
      },
    ])(req);

    const secret = this.configService.get<string>('JWT_SECRET');

    //secret doesn't exist
    if (!secret) {
      throw this.errorHandler.handleError({
        status: 500,
        message: ['JWT secret not configured'],
      });
    }

    try {
      const decoded = jwt.verify(token, secret);

      const areas = (decoded as { areas: string[] }).areas;
      const isActive = (decoded as { isActive: boolean }).isActive;
      const roles = (decoded as { roles: string[] }).roles;
      const userDocument = (decoded as { userDocument: string }).userDocument;

      //user is not active
      if (!isActive) {
        throw this.errorHandler.handleError({
          status: 401,
          message: ['User is not active '],
        });
      }

      req.user = { areas, roles };

      return true;
    } catch (error: any) {
      //if token is expired continue with refresh token
    }

    try {
      const refreshTokenId = ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.refreshTokenId || null;
        },
      ])(req);

      //refresh token does not exist
      if (!refreshTokenId) {
        throw this.errorHandler.handleError({
          status: 401,
          message: ['Refresh token not found'],
        });
      }

      const refreshToken =
        await this.refreshTokenModel.findById(refreshTokenId);

      //refresh token does not exist
      if (!refreshToken) {
        throw this.errorHandler.handleError({
          status: 401,
          message: ['refreshToken not found'],
        });
      }

      const decodedRefreshToken = jwt.verify(refreshToken.token, secret);

      const areas = (decodedRefreshToken as { areas: string[] }).areas;
      const isActive = (decodedRefreshToken as { isActive: boolean }).isActive;
      const roles = (decodedRefreshToken as { roles: string[] }).roles;
      const userDocument = (decodedRefreshToken as { userDocument: string })
        .userDocument;

      //user is not active
      if (!isActive) {
        throw this.errorHandler.handleError({
          status: 401,
          message: ['User is not active'],
        });
      }

      //Generates the new tokens
      const { token, refreshToken: newRefreshToken } = this.jwt.generateTokens({
        userDocument,
        roles,
        areas,
        isActive,
      });

      //Sets the new token on locals
      res.locals.newAccessToken = token;

      const today = new Date();
      const expiresAt = refreshToken.get('expiresAt');
      const hoursUntilExpiration =
        (expiresAt.getTime() - today.getTime()) / (1000 * 60 * 60);
      const timeToRefresh = Number(
        this.configService.get('JWT_TIME_TO_REFRESH_TOKEN') || 18,
      );

      //If JWT_TIME_TO_REFRESH_TOKEN has passed, then refreshtokenmodel
      if (hoursUntilExpiration <= timeToRefresh) {
        const payload = {
          userDocument,
          token: newRefreshToken,
          expiresAt: new Date(
            Date.now() +
              Number(
                this.configService.get('JWT_REFRESH_TOKEN_EXPIRY') || 86400000,
              ),
          ),
        };

        //Creates new refresh token on the db
        await this.refreshTokenModel.findOneAndUpdate(
          { _id: refreshTokenId },
          payload,
        );
      }

      req.user = { areas, roles };

      return true;
    } catch (error) {
      throw this.errorHandler.handleError({
        status: 401,
        message: ['user not authorized'],
      });
    }
  }
}
