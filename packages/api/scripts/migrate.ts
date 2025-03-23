import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { validateDatabaseUrl } from './utils';

const postgres = require('postgres');
dotenv.config();

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not defined');
  }

  const connectionString = process.env.DATABASE_URL;

  // validate the db URL
  try {
    validateDatabaseUrl(connectionString);
    console.log('Database URL format is valid.');
  } catch (error) {
    console.error(`Invalid database URL: ${error.message}`);
    throw error;
  }

  try {
    console.log(`Checking network connectivity to database host...`);
    const url = new URL(connectionString);
    const dns = require('dns').promises;
    await dns.lookup(url.hostname);
    console.log(`Successfully resolved hostname: ${url.hostname}`);
  } catch (error) {
    console.error(`DNS resolution failed: ${error.message}`);
    console.error(`\nPossible causes:`);
    console.error(`- Network connectivity issues`);
    console.error(`- VPN or firewall blocking the connection`);
    console.error(`- The database server might be down`);
    console.error(`- The database URL might be incorrect`);
    console.error(
      `\nTry checking your connection by pinging the host or visiting Neon dashboard.`,
    );
    throw new Error(`Failed to resolve database hostname: ${error.message}`);
  }

  console.log(`Attempting to connect to database...`);
  const sql = postgres(connectionString, {
    max: 1,
    connect_timeout: 30, // inc connection timeout to 30 seconds
    idle_timeout: 30, // Set idle timeout to 30 seconds
  });

  const db: PostgresJsDatabase = drizzle(sql);
  console.log(`Running migrations...`);

  const migrationsFolder = path.resolve(__dirname, '../drizzle');
  console.log(`Using migrations from: ${migrationsFolder}`);

  try {
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'drizzle_migrations'
      );
    `;

    if (tableExists[0].exists) {
      console.log(
        `Note: Legacy 'drizzle_migrations' table exists. Using Drizzle's built-in migration system instead.`,
      );
    }

    await migrate(db, { migrationsFolder });
    console.log('Migrations applied successfully!');
  } catch (error) {
    console.error(`Migration error: ${error.message}`);

    if (
      error.message.includes('relation "drizzle_migrations" already exists')
    ) {
      console.error(`
This error occurs because there's a conflict between our custom migration table and Drizzle's built-in one.
Try running the following SQL in your database to resolve the issue:

DROP TABLE IF EXISTS drizzle_migrations;

Then run this migration script again.
      `);
    }

    throw error;
  } finally {
    await sql.end();
  }
}

runMigrations().catch((err) => {
  console.error(`Migration failed: ${err.message}`);
  process.exit(1);
});
