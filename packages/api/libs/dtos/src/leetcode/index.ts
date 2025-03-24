import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

// Export the actual DTO class for validation and type safety
export class LeetcodeFetchResponse {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Total number of LeetCode problems solved by the user',
    example: 100,
  })
  totalSolved: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Total number of available LeetCode problems',
    example: 2000,
  })
  totalQuestions: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Number of easy difficulty problems solved',
    example: 50,
  })
  easySolved: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Number of medium difficulty problems solved',
    example: 30,
  })
  mediumSolved: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Number of hard difficulty problems solved',
    example: 20,
  })
  hardSolved: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Percentage of accepted submissions',
    example: 75,
  })
  acceptanceRate: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'User global ranking on LeetCode',
    example: 10000,
  })
  ranking: number;
}

// Export other DTOs from the module
export * from './leetcode.dto';
