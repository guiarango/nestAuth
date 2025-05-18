import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';

import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

import {
  JsonResponse,
  ResponseInfo,
} from '../common/interfaces/jsonResponse.interface';
import { JwtClass } from './classes';
import { CreateUserDto, LoginUserDto } from './dto';
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

  async logOutUser(userDocument: string): Promise<ResponseInfo<null>> {
    try {
      await this.refreshTokenModel.deleteMany({ userDocument });

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
