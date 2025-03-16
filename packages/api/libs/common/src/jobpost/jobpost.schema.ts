import {
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { users } from '../user';
import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';

export const linkedinJobs = pgTable('linkedin_jobs', {
  id: uuid('id').primaryKey().defaultRandom().unique(),
  linkedinJobId: text('linkedin_job_id').notNull().unique(),
  jobInfo: text('job_info').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  processedSkills: jsonb('processed_skills')
    .notNull()
    .default('{"message": "no data"}'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const userJobPostRelation = relations(linkedinJobs, ({ many }) => ({
  user: many(users),
}));

export type LinkedinJob = InferSelectModel<typeof linkedinJobs>;
export type NewLinkedinJob = InferInsertModel<typeof linkedinJobs>;

export const userFetchedJobs = pgTable(
  'user_saved_jobs',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    linkedinJobSchemaId: uuid('linkedin_job_schema_id')
      .notNull()
      .references(() => linkedinJobs.id, { onDelete: 'cascade' }),
    savedAt: timestamp('saved_at').defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.linkedinJobSchemaId] })],
);

export const userFetchedJobsRelation = relations(
  userFetchedJobs,
  ({ one }) => ({
    user: one(users, {
      fields: [userFetchedJobs.userId],
      references: [users.id],
    }),
    linkedinJob: one(linkedinJobs, {
      fields: [userFetchedJobs.linkedinJobSchemaId],
      references: [linkedinJobs.id],
    }),
  }),
);
