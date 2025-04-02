import { plainToClass } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsString,
  validateSync,
  IsOptional,
  IsBoolean,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmenVariable {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @IsOptional()
  PORT: number;

  @IsString()
  @IsOptional()
  ALLOWED_ORIGINS: string;

  @IsString()
  @IsOptional()
  OPENAI_API_KEY: string;

  @IsNumber()
  @IsOptional()
  THROTTLE_LIMIT: number;

  @IsNumber()
  @IsOptional()
  THROTTLE_TTL: number;

  @IsBoolean()
  @IsOptional()
  CACHE_ENABLED: boolean;

  @IsNumber()
  @IsOptional()
  CACHE_TTL: number;

  @IsBoolean()
  @IsOptional()
  METRICS_ENABLED: boolean;
}

export function validate(config: Record<string, number>) {
  const validatedConfig = plainToClass(EnvironmenVariable, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
