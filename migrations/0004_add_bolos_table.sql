-- Добавление таблицы bolos для BOLO функциональности
CREATE TABLE "bolos" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"vehicle" text,
	"plate" text,
	"reason" text,
	"priority" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"location" text,
	"issued_by" text,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"additional_info" text,
	"created_at" timestamp DEFAULT now() NOT NULL
); 