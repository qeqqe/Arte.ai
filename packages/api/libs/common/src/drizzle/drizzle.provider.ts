import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class DrizzleProvider {
  private readonly logger = new Logger(DrizzleProvider.name);

  constructor(private configService: ConfigService) {}

  async createClient() {
    const databaseUrl = this.configService.getOrThrow<string>('DATABASE_URL');

    this.logger.log(
      `Connecting to database: ${this.maskDatabaseUrl(databaseUrl)}`,
    );

    try {
      const pool = new Pool({
        connectionString: databaseUrl,
        ssl: {
          rejectUnauthorized: false,
        },
        connectionTimeoutMillis: 5000,
      });

      const client = await pool.connect();
      const res = await client.query('SELECT NOW()');
      client.release();

      this.logger.log(`Database connection successful: ${res.rows[0].now}`);

      return drizzle(pool);
    } catch (error) {
      this.logger.error(
        `Failed to connect to database: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private maskDatabaseUrl(url: string): string {
    try {
      const parsedUrl = new URL(url);
      return `${parsedUrl.protocol}//${parsedUrl.username}:***@${parsedUrl.host}${parsedUrl.pathname}`;
    } catch {
      return 'Invalid database URL';
    }
  }
}
