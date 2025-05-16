import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { Observable } from 'rxjs';
import { SafixToken } from '../../entities';

@Injectable()
export class AuthSafixInterceptor implements NestInterceptor {
  constructor(
    @InjectModel(SafixToken.name)
    private readonly safixTokenModel: Model<SafixToken>,
    private configService: ConfigService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    try {
      const request = context.switchToHttp().getRequest();

      //get the last safix token
      const safixToken = await this.safixTokenModel.findOne(
        {},
        {},
        { sort: { createdAt: -1 } },
      );

      if (!safixToken) {
        throw new UnauthorizedException('Invalid safix token');
      }

      request.safixToken = safixToken;
    } catch (error) {
      throw new UnauthorizedException('Invalid safix token');
    }

    // if (!cookies || !cookies.refreshToken || !cookies.refreshTokenId) {
    //   throw new UnauthorizedException('Missing refresh tokens cookies');
    // }

    return next.handle();
  }
}
