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
  if (!db) throw new Error("db is required for socialMediaPostRepository");

  return {
    async create(data: NewSocialMediaPost): Promise<SocialMediaPost> {
      const [row] = await db.insert(socialMediaPosts).values(data).returning();
      if (!row) throw new Error("Failed to create social media post");
      return row;
    },
    async listByFeedItem(feedItemId: string): Promise<SocialMediaPost[]> {
      if (!feedItemId) return [];
      const rows = await db
        .select()
        .from(socialMediaPosts)
        .where(eq(socialMediaPosts.feedItemId, feedItemId));
      return rows;
    },
    async findById(id: string): Promise<SocialMediaPost | null> {
      if (!id) return null;
      const [row] = await db
        .select()
        .from(socialMediaPosts)
        .where(eq(socialMediaPosts.id, id));
      return row || null;
    },
    async markPublished(id: string): Promise<void> {
      if (!id) return;
      await db
        .update(socialMediaPosts)
        .set({ status: "published", updatedAt: new Date() as any })
        .where(eq(socialMediaPosts.id, id));
    },
  };
}
