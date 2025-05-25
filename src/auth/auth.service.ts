import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';

import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { Request } from 'express';

import { ResponseInfo } from '../common/interfaces/jsonResponse.interface';
import { JwtClass } from './classes';
import { AuthMeDto, CreateUserDto, LoginUserDto } from './dto';
import { RefreshToken, User } from './entities';
import { JwtResponse } from './interfaces';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshToken>,
    private configService: ConfigService,
    private jwt: JwtClass,
  ) {}

  async createUser(
    createUserDto: CreateUserDto,
  ): Promise<ResponseInfo<JwtResponse> | ResponseInfo<null>> {
    const { password, ...userData } = createUserDto;

    //!TODO check that the user exists in the safix database

    let data: User;

    try {
      data = await this.userModel.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('User already exists');
      }
      this.logger.error('Error', error.stack);
      throw new Error(error);
    }

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

    try {
      const refreshTokenInfo = await this.refreshTokenModel.create(payload);

      return {
        ok: true,
        data: {
          ...user,
          token,
          refreshTokenId: refreshTokenInfo.id,
        },
      };
    } catch (error) {
      this.logger.error(error);
      throw new Error(error);
    }
  }

  async loginUser(
    loginUserDto: LoginUserDto,
  ): Promise<ResponseInfo<JwtResponse>> {
    const { password, userDocument } = loginUserDto;

    //Gets the user data and the password
    const userData = await this.userModel
      .findOne({ userDocument })
      .select('+password');

    //Checks if the user exists and if the password is correct
    if (!userData || !bcrypt.compareSync(password, userData.password)) {
      throw new UnauthorizedException('Credentials are not valid');
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

    try {
      //Creates new refresh token
      const refreshTokenInfo = await this.refreshTokenModel.create(payload);

      return {
        ok: true,
        data: {
          ...user,
          token,
          refreshTokenId: refreshTokenInfo.id,
        },
      };
    } catch (error) {
      this.logger.error('Error', error.stack);
      throw new Error(error);
    }
  }

  async returnUserInfo(req: Request) {
    const { token, refreshTokenId } = req.cookies;
    const reqUser = req as unknown as {
      user: { userDocument: string; newToken: string; refreshTokenExp: Date };
    };
    const { userDocument, newToken, refreshTokenExp } = reqUser.user;

    const secret = this.configService.get('JWT_SECRET');

    if (!secret) {
      throw new InternalServerErrorException('JWT secret not configured');
    }

    try {
      //Just to continue with the flow
      if (!token || token === 'undefined') {
        throw new Error('Token is required');
      }

      const userData = await this.userModel.findOne({ userDocument });

      if (!userData) throw new Error('User not found');

      const user = userData.toObject();
      delete (user as any).password;

      return {
        ok: true,
        data: {
          ...user,
        },
      };
    } catch (error) {
      //If the token is expired, we need to continue with the flow
    }

    try {
      const userData = await this.userModel.findOne({ userDocument });

      if (!userData) {
        throw new UnauthorizedException('User not found');
      }

      const user = userData.toObject();
      delete (user as any).password;

      const decoded = jwt.verify(newToken, secret);

      const { exp: tokenExp } = decoded as unknown as {
        exp: number;
      };

      return {
        ok: true,
        data: {
          ...user,
          newToken: {
            newToken,
            tokenExp: tokenExp,
          },
          newRefreshToken: { refreshTokenId, refreshTokenExp },
        },
      };
    } catch (error) {
      this.logger.error('Error', error.stack);
      throw new Error(error);
    }
  }

  async validateTokens(req: Request): Promise<ResponseInfo<null>> {
    return { data: null, ok: true };
  }

  async logOutUser(req: Request) {
    const { refreshTokenId } = req.cookies;

    try {
      await this.refreshTokenModel.deleteMany({ _id: refreshTokenId });

      return {
        ok: true,
        data: null,
      };
    } catch (error) {
      this.logger.error('Error', error.stack);
      throw new Error(error);
    }
  }
}
