import { db } from "../db";
import {
  socialMediaPosts,
  type NewSocialMediaPost,
  type SocialMediaPost,
} from "../db/schema";
import { eq, and } from "drizzle-orm";

export interface SocialMediaPostRepository {
  create(data: NewSocialMediaPost): Promise<SocialMediaPost>;
  listByFeedItem(feedItemId: string): Promise<SocialMediaPost[]>;
  findById(id: string): Promise<SocialMediaPost | null>;
  markPublished(id: string): Promise<void>;
}

interface Dependencies {
  db: typeof db;
}

export function createSocialMediaPostRepository({
  db,
}: Dependencies): SocialMediaPostRepository {
  // Allow boot without DB; defer failure to method calls

  return {
    async create(data: NewSocialMediaPost): Promise<SocialMediaPost> {
      if (!db) throw new Error("Database is not configured");
      const [row] = await db.insert(socialMediaPosts).values(data).returning();
      if (!row) throw new Error("Failed to create social media post");
      return row;
    },
    async listByFeedItem(feedItemId: string): Promise<SocialMediaPost[]> {
      if (!db) throw new Error("Database is not configured");
      if (!feedItemId) return [];
      const rows = await db
        .select()
        .from(socialMediaPosts)
        .where(eq(socialMediaPosts.feedItemId, feedItemId));
      return rows;
    },
    async findById(id: string): Promise<SocialMediaPost | null> {
      if (!db) throw new Error("Database is not configured");
      if (!id) return null;
      const [row] = await db
        .select()
        .from(socialMediaPosts)
        .where(eq(socialMediaPosts.id, id));
      return row || null;
    },
    async markPublished(id: string): Promise<void> {
      if (!db) throw new Error("Database is not configured");
      if (!id) return;
      await db
        .update(socialMediaPosts)
        .set({ status: "published", updatedAt: new Date() as any })
        .where(eq(socialMediaPosts.id, id));
    },
  };
}
