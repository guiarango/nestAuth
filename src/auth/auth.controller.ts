import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';

import { Request } from 'express';

import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { CreateUserDto, LoginUserDto } from './dto';
import { SetCookieInterceptor } from './interceptors/cookie-interceptor';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseInterceptors(SetCookieInterceptor)
  @Post('register')
  @HttpCode(201)
  createUser(@Body() createAuthDto: CreateUserDto) {
    return this.authService.createUser(createAuthDto);
  }

  @Post('authMe')
  @UseInterceptors(SetCookieInterceptor)
  @HttpCode(200)
  returnUserInfo(@Req() req: Request) {
    return this.authService.returnUserInfo(req);
  }

  @Public()
  @Post('login')
  @UseInterceptors(SetCookieInterceptor)
  @HttpCode(200)
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  // @Public()
  @HttpCode(200)
  @Delete('logout')
  logOutUser(@Req() req: Request) {
    return this.authService.logOutUser(req);
  }

  // @AreaProtected(ValidAreas.admon)
  // @UseGuards(UserAreaGuard)
  // @RoleProtected(ValidRoles.admin)
  // @UseGuards(UserRoleGuard)
  // @Auth()
  // @RolesAreasProtection({
  //   areas: [ValidAreas.admon],
  //   roles: [ValidRoles.admin],
  // })
}
