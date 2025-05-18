import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RefreshToken,
  User,
  RefreshTokenSchema,
  UserSchema,
  SafixTokenSchema,
  SafixToken,
} from './entities';
// import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtClass } from './classes';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtClass],
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
      { name: SafixToken.name, schema: SafixTokenSchema },
    ]),
    // PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
        };
      },
    }),
  ],
  // exports: [MongooseModule, JwtStrategy, PassportModule, JwtModule],
  exports: [MongooseModule, JwtModule, JwtClass],
})
export class AuthModule {}
