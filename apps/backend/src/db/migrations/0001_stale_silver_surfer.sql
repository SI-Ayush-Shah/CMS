CREATE TYPE "public"."social_platform" AS ENUM('instagram', 'twitter');--> statement-breakpoint
CREATE TABLE "social_media_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform" "social_platform" NOT NULL,
	"text" text NOT NULL,
	"image_url" varchar(1024),
	"hashtags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"link" varchar(1024),
	"feed_item_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_social_media_posts_instagram_image_required" CHECK ((platform <> 'instagram') OR (image_url IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "social_media_posts" ADD CONSTRAINT "social_media_posts_feed_item_id_rss_feed_items_id_fk" FOREIGN KEY ("feed_item_id") REFERENCES "public"."rss_feed_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_social_media_posts_platform" ON "social_media_posts" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "idx_social_media_posts_feed_item" ON "social_media_posts" USING btree ("feed_item_id");