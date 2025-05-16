ALTER TABLE "user_github_schema" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "avatar_url";