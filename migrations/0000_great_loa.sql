CREATE TABLE "ai_analysis" (
	"id" serial PRIMARY KEY NOT NULL,
	"log_id" integer NOT NULL,
	"category" text NOT NULL,
	"importance" text NOT NULL,
	"suggestions" json NOT NULL,
	"keywords" json NOT NULL,
	"follow_up_actions" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"check_in_time" timestamp DEFAULT now() NOT NULL,
	"check_out_time" timestamp,
	"location" text NOT NULL,
	"coordinates" text NOT NULL,
	"device_id" text,
	"is_valid" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "geofence_zones" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"coordinates" text NOT NULL,
	"radius" integer,
	"is_active" boolean DEFAULT true,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "handover_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"log_number" text NOT NULL,
	"user_id" integer NOT NULL,
	"shift" text NOT NULL,
	"type" text NOT NULL,
	"status" text NOT NULL,
	"content" text NOT NULL,
	"comments" text,
	"reviewed_by" integer,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "handover_logs_log_number_unique" UNIQUE("log_number")
);
--> statement-breakpoint
CREATE TABLE "incidents" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"priority" text NOT NULL,
	"status" text NOT NULL,
	"reported_by" integer NOT NULL,
	"resolved_by" integer,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shifts" (
	"id" serial PRIMARY KEY NOT NULL,
	"shift_type" text NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"users" text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"assigned_to" integer NOT NULL,
	"created_by" integer NOT NULL,
	"status" text NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"content" text NOT NULL,
	"created_by" integer NOT NULL,
	"is_ai_generated" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"full_name" text NOT NULL,
	"role" integer NOT NULL,
	"initials" text NOT NULL,
	"email" text,
	"contact" text,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
