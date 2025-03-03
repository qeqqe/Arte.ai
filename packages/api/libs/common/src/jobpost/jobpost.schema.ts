import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from '../user';
import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';

export const JobPostSchema = pgTable('jobpost', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: integer('job_id').notNull(),
  jobPostInfo: text('job_post_info').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userJobPosts = pgTable('user_job_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  jobPostId: uuid('job_post_id')
    .notNull()
    .references(() => JobPostSchema.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const JobPostRelations = relations(JobPostSchema, ({ many }) => ({
  userJobPosts: many(userJobPosts),
}));

export const UserJobPostRelations = relations(userJobPosts, ({ one }) => ({
  user: one(users, {
    fields: [userJobPosts.userId],
    references: [users.id],
  }),
  jobPost: one(JobPostSchema, {
    fields: [userJobPosts.jobPostId],
    references: [JobPostSchema.id],
  }),
}));

export type JobPost = InferSelectModel<typeof JobPostSchema>;
export type NewJobPost = InferInsertModel<typeof JobPostSchema>;
export type UserJobPost = InferSelectModel<typeof userJobPosts>;
export type NewUserJobPost = InferInsertModel<typeof userJobPosts>;
