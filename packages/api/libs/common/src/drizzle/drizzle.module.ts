import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as userSchema from '../user/user.schema';
export const DRIZZLE = Symbol('drizzle-connection');

@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const DATABASE_URL = config.getOrThrow<string>('DATABASE_URL');
        const NODE_ENV = config.getOrThrow<string>('NODE_ENV');
        const pool = new Pool({
          connectionString: DATABASE_URL,
          ssl: NODE_ENV == 'production' ? true : false,
        });
        return drizzle(pool, { schema: { ...userSchema } });
      },
    },
  ],

  exports: [DRIZZLE],
})
export class DrizzleModule {}
