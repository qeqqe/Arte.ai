import * as postgres from 'postgres';
import * as dotenv from 'dotenv';
import { validateDatabaseUrl } from './utils';

dotenv.config();

async function resetMigrationTables() {
  if (process.env.NODE_ENV === 'production') {
    console.error(
      '⛔ This script should not be run in production environments!',
    );
    console.error(
      'It will reset all migration tracking and could lead to data corruption.',
    );
    console.error(
      'If you really need to run this in production, set FORCE_RESET=true',
    );

    if (process.env.FORCE_RESET !== 'true') {
      process.exit(1);
    } else {
      console.warn(
        '⚠️ Forced reset in production environment. Proceed with caution!',
      );
    }
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not defined');
  }

  const connectionString = process.env.DATABASE_URL;

  try {
    validateDatabaseUrl(connectionString);
    console.log('Database URL format is valid.');

    const sql = postgres(connectionString, { max: 1 });

    console.log('Connected to database. Checking for migration tables...');

    const customTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'drizzle_migrations'
      );
    `;

    const drizzleTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '__drizzle_migrations'
      );
    `;

    if (customTableExists[0].exists) {
      console.log('Found custom drizzle_migrations table. Dropping...');
      await sql`DROP TABLE IF EXISTS drizzle_migrations;`;
      console.log('✅ Dropped custom drizzle_migrations table.');
    } else {
      console.log('Custom drizzle_migrations table not found.');
    }

    if (drizzleTableExists[0].exists) {
      console.log('Found Drizzle __drizzle_migrations table. Dropping...');
      await sql`DROP TABLE IF EXISTS __drizzle_migrations;`;
      console.log('✅ Dropped Drizzle __drizzle_migrations table.');
    } else {
      console.log('Drizzle __drizzle_migrations table not found.');
    }

    console.log(
      '\nMigration tables have been reset. You can now run migrations from a clean state.',
    );
    console.log('Run: pnpm run db:migrate');

    await sql.end();
  } catch (error) {
    console.error(`Error resetting migration tables: ${error.message}`);
    process.exit(1);
  }
}

resetMigrationTables().catch(console.error);
