-- Add status enum and status column to social_media_posts
DO $$ BEGIN
  CREATE TYPE social_status AS ENUM ('draft', 'published');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE social_media_posts
  ADD COLUMN IF NOT EXISTS status social_status NOT NULL DEFAULT 'draft';

-- Index could be useful for filtering by status
CREATE INDEX IF NOT EXISTS idx_social_media_posts_status ON social_media_posts (status);


