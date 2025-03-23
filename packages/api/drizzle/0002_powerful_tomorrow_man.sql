CREATE TABLE "drizzle_migrations" (
	"id" text PRIMARY KEY NOT NULL,
	"hash" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
