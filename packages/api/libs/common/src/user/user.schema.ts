import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// TODO: Basic user schema will update later

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  username: text('username').unique().notNull(),
  email: text('email').unique().notNull(),
  refreshToken: text('refreshToken').unique().notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});
