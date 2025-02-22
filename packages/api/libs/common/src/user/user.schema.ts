import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { userGithubSchema } from '../github';
import { relations, InferSelectModel, InferInsertModel } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  avatarUrl: text('avatar_url'),
  refreshToken: text('refresh_token').unique(),
  lastLogin: timestamp('last_login').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export const userApplicationRelations = relations(users, ({ one }) => ({
  github: one(userGithubSchema, {
    fields: [users.id],
    references: [userGithubSchema.userId],
  }),
}));
