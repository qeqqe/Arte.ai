import { IsString, IsEmail, IsNotEmpty, IsUrl } from 'class-validator';

export class GithubUserDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsUrl()
  avatarUrl: string;

  @IsString()
  @IsNotEmpty()
  accessToken: string;
}

export interface TokenPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}
