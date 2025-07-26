ALTER TABLE "characters" ADD COLUMN "gender" text;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "ethnicity" text;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "height" text;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "weight" text;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "hair_color" text;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "eye_color" text;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "phone_number" text;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "postal" text;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "occupation" text;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "dead" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "date_of_dead" date;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "missing" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "arrested" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "callsign" text;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "callsign2" text;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "suspended" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "whitelist_status" text DEFAULT 'PENDING';--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "radio_channel_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "has_2fa" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_dark_theme" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "sound_settings" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "api_token" text;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_api_token_unique" UNIQUE("api_token");