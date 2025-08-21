ALTER TABLE "generated_contents" ADD COLUMN "images" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "generated_contents" ADD COLUMN "banner_url" varchar(1024);