CREATE TABLE "user_pinned_repo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"description" text DEFAULT 'No description' NOT NULL,
	"stargazer_count" integer DEFAULT 0 NOT NULL,
	"fork_count" integer DEFAULT 0 NOT NULL,
	"user_id" uuid,
	"primary_language" text DEFAULT 'Unknown' NOT NULL,
	"repository_topics" jsonb DEFAULT '[]' NOT NULL,
	"languages" jsonb DEFAULT '[]' NOT NULL,
	"readme" text DEFAULT 'No readme.md exists' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_github_schema" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"github_id" text NOT NULL,
	"access_token" text NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "linkedin_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"linkedin_job_id" text NOT NULL,
	"job_info" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"processed_skills" jsonb DEFAULT '{"message": "no data"}' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "linkedin_jobs_id_unique" UNIQUE("id"),
	CONSTRAINT "linkedin_jobs_linkedin_job_id_unique" UNIQUE("linkedin_job_id")
);
--> statement-breakpoint
CREATE TABLE "user_saved_jobs" (
	"user_id" uuid NOT NULL,
	"linkedin_job_schema_id" uuid NOT NULL,
	"saved_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_saved_jobs_user_id_linkedin_job_schema_id_pk" PRIMARY KEY("user_id","linkedin_job_schema_id")
);
--> statement-breakpoint
CREATE TABLE "user_leetcode_schema" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"leetcode_username" text NOT NULL,
	"total_solved" integer NOT NULL,
	"total_questions" integer NOT NULL,
	"easy_solved" integer NOT NULL,
	"medium_solved" integer NOT NULL,
	"hard_solved" integer NOT NULL,
	"acceptance_rate" integer NOT NULL,
	"ranking" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"avatar_url" text,
	"resume" text,
	"refresh_token" text,
	"last_login" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_refresh_token_unique" UNIQUE("refresh_token")
);
--> statement-breakpoint
ALTER TABLE "user_pinned_repo" ADD CONSTRAINT "user_pinned_repo_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_github_schema" ADD CONSTRAINT "user_github_schema_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_saved_jobs" ADD CONSTRAINT "user_saved_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_saved_jobs" ADD CONSTRAINT "user_saved_jobs_linkedin_job_schema_id_linkedin_jobs_id_fk" FOREIGN KEY ("linkedin_job_schema_id") REFERENCES "public"."linkedin_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_leetcode_schema" ADD CONSTRAINT "user_leetcode_schema_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;