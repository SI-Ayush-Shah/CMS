CREATE TYPE "public"."content_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."rss_update_interval" AS ENUM('15_minutes', '30_minutes', '1_hour', '2_hours', '6_hours', '12_hours', '24_hours');--> statement-breakpoint
CREATE TABLE "generated_contents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"summary" varchar(1024) NOT NULL,
	"category" varchar(128) NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"body" jsonb NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "rss_feeds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"feed_name" varchar(255) NOT NULL,
	"feed_source_url" varchar(1024) NOT NULL,
	"update_interval" "rss_update_interval" DEFAULT '1_hour' NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rss_feed_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"feed_id" uuid NOT NULL,
	"guid" varchar(512),
	"title" varchar(512) NOT NULL,
	"link" varchar(1024) NOT NULL,
	"summary" text,
	"content" text,
	"image_url" varchar(1024),
	"social_media_caption" text,
	"social_media_hashtags" text,
	"author" varchar(255),
	"categories" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"published_at" timestamp with time zone,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_rss_feed_items_feed_guid" UNIQUE("feed_id","guid"),
	CONSTRAINT "uq_rss_feed_items_feed_link" UNIQUE("feed_id","link")
);
--> statement-breakpoint
ALTER TABLE "rss_feed_items" ADD CONSTRAINT "rss_feed_items_feed_id_rss_feeds_id_fk" FOREIGN KEY ("feed_id") REFERENCES "public"."rss_feeds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_rss_feed_items_feed_id" ON "rss_feed_items" USING btree ("feed_id");--> statement-breakpoint
CREATE INDEX "idx_rss_feed_items_published_at" ON "rss_feed_items" USING btree ("published_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_rss_feed_items_fetched_at" ON "rss_feed_items" USING btree ("fetched_at" DESC NULLS LAST);