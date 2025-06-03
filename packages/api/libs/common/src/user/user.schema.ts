import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { userGithubSchema } from '../github';
import { relations, InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { UserLeetcodeSchema } from '../leetcode';
import { userFetchedJobs } from '../jobpost';
import { userPinnedRepo } from '../github';
import { SkillsData } from '../jobpost/skills.types';
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  resume: text('resume'),
  refreshToken: text('refresh_token').unique(),
  lastLogin: timestamp('last_login').defaultNow().notNull(),
  userProcessedSkills: jsonb('user_proccessed_skills')
    .$type<SkillsData>()
    .notNull()
    .default({
      languages: [],
      frontend_frameworks_libraries: [],
      frontend_styling_ui: [],
      backend_frameworks_runtime: [],
      databases_datastores: [],
      database_tools_orms: [],
      cloud_platforms: [],
      devops_cicd: [],
      infrastructure_as_code_config: [],
      monitoring_observability: [],
      ai_ml_datascience: [],
      mobile_development: [],
      testing_quality: [],
      apis_communication: [],
      architecture_design_patterns: [],
      security: [],
      methodologies_collaboration: [],
      operating_systems: [],
      web_servers_proxies: [],
      other_technologies_concepts: [],
      other_relevent_info: [],
      brief_skill_description: [],
    }),
  onboardingStatus: jsonb('onboarding_status')
    .$type<{ github: boolean; leetcode: boolean; resume: boolean }>()
    .default({ github: false, leetcode: false, resume: false })
    .notNull(),
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
