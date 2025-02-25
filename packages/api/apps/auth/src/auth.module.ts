import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoggerModule } from '@app/common';
import { DrizzleModule } from '@app/common/drizzle/drizzle.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import * as Joi from 'joi';
import { UserService } from './user.service';
import { TokenService } from './token.service';
import { GithubStrategy } from './strategies/github.strategy';
import { join } from 'path';
import { RmqModule } from '@app/common/rmq/rmq.module';

@Module({
  imports: [
    LoggerModule,
    DrizzleModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(__dirname, '..', '..', '..', 'apps', 'auth', '.env'),
        join(__dirname, '..', '.env'),
        '.env',
      ],
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        NODE_ENV: Joi.string().valid('development', 'production').required(),
        HTTP_PORT: Joi.number().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.number().required(),
        GITHUB_CLIENT_ID: Joi.string().required(),
        GITHUB_CLIENT_SECRET: Joi.string().required(),
        GITHUB_CALLBACK_URL: Joi.string().required(),
        FRONTEND_URL: Joi.string().required(),
        JWT_ACCESS_EXPIRATION: Joi.string().required(),
        JWT_REFRESH_EXPIRATION: Joi.string().required(),
        RABBITMQ_URI: Joi.string().required(),
      }),
    }),
    PassportModule.register({ defaultStrategy: 'github' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: `${config.getOrThrow('JWT_EXPIRATION')}s`,
        },
      }),
    }),
    RmqModule.register({ name: 'AUTH_SERVICE' }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, TokenService, GithubStrategy],
})
export class AuthModule {}
