import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';

import { ParseMongoIdPipe } from '../common/pipes/parse-mongo-id.pipe';
import { AuthService } from './auth.service';
import { Auth } from './decorators';
import { Public } from './decorators/public.decorator';
import { CreateUserDto, LoginUserDto } from './dto';
import {
  DeleteCookieInterceptor,
  SetAuthCookiesInterceptor,
  SetCookieInterceptor,
} from './interceptors/cookie-interceptor';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseInterceptors(SetCookieInterceptor)
  @Post('register')
  @HttpCode(201)
  createUser(@Body() createAuthDto: CreateUserDto) {
    return this.authService.createUser(createAuthDto);
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
  @Public()
  @Post('login')
  @UseInterceptors(SetCookieInterceptor)
  @HttpCode(200)
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  // @UseInterceptors(ReadCookieInterceptor)
  // @UseInterceptors(SetCookieInterceptor)
  // @Post('refresh-token')
  // refreshToken(@Req() request: Request) {
  //   return this.authService.updateToken(request);
  // }

  @UseInterceptors(DeleteCookieInterceptor)
  @Delete('logout/:userId')
  logOutUser(@Param('userId', ParseMongoIdPipe) userId: string) {
    return this.authService.logOutUser(userId);
  }
}
