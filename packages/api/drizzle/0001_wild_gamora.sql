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
ALTER TABLE "user_leetcode_schema" ADD CONSTRAINT "user_leetcode_schema_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;