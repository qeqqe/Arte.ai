import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { userGithubSchema } from '../github';
import { relations, InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { UserLeetcodeSchema } from '../leetcode';
import { userFetchedJobs } from '../jobpost';
import { userPinnedRepo } from '../github';
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  avatarUrl: text('avatar_url'),
  resume: text('resume'),
  refreshToken: text('refresh_token').unique(),
  lastLogin: timestamp('last_login').defaultNow().notNull(),
  userProcessedSkills: jsonb('user_proccessed_skills').notNull().default('[]'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export const userRelations = relations(users, ({ one, many }) => ({
  github: one(userGithubSchema, {
    fields: [users.id],
    references: [userGithubSchema.userId],
  }),
  leetcode: one(UserLeetcodeSchema, {
    fields: [users.id],
    references: [UserLeetcodeSchema.userId],
  }),
  userJobPosts: many(userFetchedJobs),
  pinnedRepo: many(userPinnedRepo),
}));
