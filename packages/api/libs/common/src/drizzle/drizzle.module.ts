import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as githubSchema from '@app/common/github';
import * as userSchema from '@app/common/user';

export const DRIZZLE = Symbol('drizzle-connection');

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const DATABASE_URL = config.getOrThrow<string>('DATABASE_URL');
        const NODE_ENV = config.getOrThrow<string>('NODE_ENV');
        const pool = new Pool({
          connectionString: DATABASE_URL,
          ssl: NODE_ENV === 'production',
        });
        return drizzle(pool, { schema: { ...githubSchema, ...userSchema } });
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DrizzleModule {}
