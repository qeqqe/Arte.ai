import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
import {
  integer,
  jsonb,
  pgTable,
  text,
  uuid,
  timestamp,
} from 'drizzle-orm/pg-core';
import { users } from '../user';

export const userPinnedRepo = pgTable('user_pinned_repo', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: text('name').notNull(),
  url: text('url').notNull(),
  description: text('description').notNull().default('No description'),
  stargazerCount: integer('stargazer_count').notNull().default(0),
  forkCount: integer('fork_count').notNull().default(0),
  userId: uuid('user_id').references(() => users.id),
  primaryLanguage: text('primary_language').notNull().default('Unknown'),
  repositoryTopics: jsonb('repository_topics').notNull().default('[]'),
  languages: jsonb('languages').notNull().default('[]'),
  readme: text('readme').notNull().default('No readme.md exists'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type PinnedRepo = InferSelectModel<typeof userPinnedRepo>;
export type NewPinnedRepo = InferInsertModel<typeof userPinnedRepo>;

export const userPinnedRepoToUserRelation = relations(
  userPinnedRepo,
  ({ one }) => ({
    user: one(users, {
      fields: [userPinnedRepo.userId],
      references: [users.id],
    }),
  }),
);
