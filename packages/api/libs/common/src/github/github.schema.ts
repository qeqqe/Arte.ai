import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from '../user';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export const userGithubSchema = pgTable('user_github_schema', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  githubId: text('github_id').notNull(),
  accessToken: text('access_token').notNull(),
  username: text('username').notNull(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type UserGithub = InferSelectModel<typeof userGithubSchema>;
export type NewUserGithub = InferInsertModel<typeof userGithubSchema>;
