import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './libs/common/src/**/*.schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DATABASE_URL || 'postgres://postgres:test@localhost:5432/sga',
  },
});
