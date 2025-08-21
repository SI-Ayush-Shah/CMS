import { sql } from "../db/connection";

async function ensureSocialStatus(): Promise<void> {
  if (!sql) {
    console.error("❌ Database not available - set DATABASE_URL");
    process.exit(1);
  }

  try {
    // Create enum if missing
    await (sql as any).query(`
DO $$ BEGIN
  CREATE TYPE social_status AS ENUM ('draft', 'published');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;`);

    // Add column if missing
    await (sql as any).query(`
ALTER TABLE social_media_posts
  ADD COLUMN IF NOT EXISTS status social_status NOT NULL DEFAULT 'draft';`);

    // Index if missing
    await (sql as any).query(`
CREATE INDEX IF NOT EXISTS idx_social_media_posts_status ON social_media_posts (status);`);

    console.log("✅ Ensured social_media_posts.status exists");
  } catch (err) {
    console.error("❌ Failed ensuring social status column:", err);
    process.exit(1);
  }
}

if (require.main === module) {
  ensureSocialStatus().then(() => process.exit(0));
}

export { ensureSocialStatus };
