import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

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

// DTO for username requests
export class LeetcodeUsernameDto {
  @ApiProperty({
    description: 'LeetCode username',
    example: 'johndoe',
  })
  @IsString()
  @IsNotEmpty()
  username: string;
}

export interface LeetcodeUsernameRequest {
  username: string;
}
