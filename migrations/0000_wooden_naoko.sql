CREATE TABLE "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_id" integer NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"data" jsonb NOT NULL,
	"result" jsonb,
	"reviewer_id" integer,
	"review_comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "complaints" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_id" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"incident_date" timestamp NOT NULL,
	"incident_type" text NOT NULL,
	"participants" text NOT NULL,
	"description" text NOT NULL,
	"evidence_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"full_name" text NOT NULL,
	"logo_url" text,
	"description" text,
	"gallery" text[] DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"recipient_id" integer NOT NULL,
	"content" text NOT NULL,
	"link" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_id" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"file_url" text NOT NULL,
	"supervisor_comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_id" integer NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"handler_id" integer,
	"messages" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tests" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"related_to" jsonb NOT NULL,
	"duration_minutes" integer NOT NULL,
	"questions" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'candidate' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"department_id" integer,
	"secondary_department_id" integer,
	"rank" text,
	"division" text,
	"qualifications" text[] DEFAULT '{}',
	"game_warnings" integer DEFAULT 0 NOT NULL,
	"admin_warnings" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
