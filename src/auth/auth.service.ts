import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';

import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

import { JsonResponse } from '../common/interfaces/jsonResponse.interface';
import { ErrorHandler } from '../error/classes/errorHandler';
import { JwtClass } from './classes';
import { CreateUserDto, LoginUserDto } from './dto';
import { RefreshToken, User } from './entities';
import { JwtResponse } from './interfaces';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshToken>,
    private configService: ConfigService,
    private errorHandler: ErrorHandler,
    private jwt: JwtClass,
  ) {}

  async createUser(
    createUserDto: CreateUserDto,
  ): Promise<JsonResponse<JwtResponse> | JsonResponse<null>> {
    try {
      const { password, ...userData } = createUserDto;

      //!TODO check that the user exists in the safix database

      const data = await this.userModel.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      const user = data.toObject();
      delete (user as any).password;

      const { token, refreshToken } = this.jwt.generateTokens({
        userDocument: user.userDocument,
        roles: user.roles,
        areas: user.areas,
        isActive: user.isActive,
      });

      const payload = {
        userDocument: user.userDocument,
        token: refreshToken,
        expiresAt: new Date(
          Date.now() +
            Number(
              this.configService.get('JWT_REFRESH_TOKEN_EXPIRY') || 86400000,
            ),
        ),
      };

      const refreshTokenInfo = await this.refreshTokenModel.create(payload);

      return {
        ok: true,
        statusCode: 200,
        data: {
          ...user,
          token,
          refreshTokenId: refreshTokenInfo.id,
        },
        errors: null,
      };
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async loginUser(
    loginUserDto: LoginUserDto,
  ): Promise<JsonResponse<JwtResponse> | JsonResponse<null>> {
    try {
      const { password, userDocument } = loginUserDto;

      //Gets the user data and the password
      const userData = await this.userModel
        .findOne({ userDocument })
        .select('+password');

      //Checks if the user exists and if the password is correct
      if (!userData || !bcrypt.compareSync(password, userData.password)) {
        return this.errorHandler.handleError({
          response: { status: 401, message: ['Credentials are not valid'] },
        });
      }

      //Deletes password
      const user = userData.toObject();
      delete (user as any).password;

      //Generates the tokens
      const { token, refreshToken } = this.jwt.generateTokens({
        userDocument: user.userDocument,
        roles: user.roles,
        areas: user.areas,
        isActive: user.isActive,
      });

      const payload = {
        userDocument: user.userDocument,
        token: refreshToken,
        expiresAt: new Date(
          Date.now() +
            Number(
              this.configService.get('JWT_REFRESH_TOKEN_EXPIRY') || 86400000,
            ),
        ),
      };

      //Deletes the refresh token
      await this.refreshTokenModel.deleteMany({
        id: user.id,
      });

      //Creates new refresh token
      const refreshTokenInfo = await this.refreshTokenModel.create(payload);

      return {
        ok: true,
        statusCode: 200,
        data: {
          ...user,
          token,
          refreshTokenId: refreshTokenInfo.id,
        },
        errors: null,
      };
    } catch (error) {
      throw this.errorHandler.handleError(error);
    }
  }

  async logOutUser(userDocument: string): Promise<JsonResponse<null>> {
    await this.refreshTokenModel.deleteMany({ userDocument });

    return {
      ok: true,
      statusCode: 200,
      data: null,
      errors: null,
    };
  }
}
