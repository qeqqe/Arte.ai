import { IsNotEmpty, IsNumber } from 'class-validator';

export class LeetcodeFetchResponse {
  @IsNumber()
  @IsNotEmpty()
  totalSolved: number;

  @IsNumber()
  @IsNotEmpty()
  totalQuestions: number;

  @IsNumber()
  @IsNotEmpty()
  easySolved: number;

  @IsNumber()
  @IsNotEmpty()
  mediumSolved: number;

  @IsNumber()
  @IsNotEmpty()
  hardSolved: number;

  @IsNumber()
  @IsNotEmpty()
  acceptanceRate: number;

  @IsNumber()
  @IsNotEmpty()
  ranking: number;
}

export interface LeetcodeUsernameRequest {
  username: string;
}
