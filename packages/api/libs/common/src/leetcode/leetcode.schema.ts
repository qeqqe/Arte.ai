import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { users } from '../user';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
export const UserLeetcodeSchema = pgTable('user_leetcode_schema', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  leetcodeUsername: text('leetcode_username').notNull(),
  totalSolved: integer('total_solved').notNull(),
  totalQuestions: integer('total_questions').notNull(),
  easySolved: integer('easy_solved').notNull(),
  mediumSolved: integer('medium_solved').notNull(),
  hardSolved: integer('hard_solved').notNull(),
  acceptanceRate: integer('acceptance_rate').notNull(),
  ranking: integer('ranking').notNull(),
  proccessedLeetcodeStat: jsonb('proccessed_leetcode_stat')
    .notNull()
    .default('[]'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type UserLeetcode = InferSelectModel<typeof UserLeetcodeSchema>;
export type NewUserLeetcode = InferInsertModel<typeof UserLeetcodeSchema>;
