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
import { SkillGapAnalysis } from './comparison.types';
import { Organization as OrganizationInterface } from '@app/common/jobpost';

export const linkedinJobs = pgTable('linkedin_jobs', {
  id: uuid('id').primaryKey().defaultRandom().unique(),
  linkedinJobId: text('linkedin_job_id').notNull().unique(),
  jobInfo: text('job_info').notNull(),
  organization: jsonb('organization')
    .$type<OrganizationInterface>()
    .default({
      logo_url: '',
      name: '',
      location: '',
    })
    .notNull(),
  postedTimeAgo: text('posted_time_ago').default('N/A').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  processedSkills: jsonb('processed_skills').notNull(),
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
    comparison: jsonb('comparison')
      .$type<SkillGapAnalysis>()
      .$default(() => ({
        matchedSkills: [],
        gapAnalysis: [],
        overallScore: { value: 0, category: 'insufficient' },
        recommendations: [],
        insights: '',
        metadata: {
          generatedAt: new Date().toISOString(),
        },
      }))
      .notNull(),
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
