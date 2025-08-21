import { db } from "../db";
import { socialMediaPosts, type SocialMediaPost } from "../db/schema";
import { and, desc, eq, count } from "drizzle-orm";

export interface ListParams {
  platform?: "instagram" | "twitter";
  page?: number;
  pageSize?: number;
}

export interface ListResult {
  items: SocialMediaPost[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SocialMediaPostService {
  list(params: ListParams): Promise<ListResult>;
  publish(id: string): Promise<{
    success: true;
    platform: "twitter" | "instagram";
    platformPostId?: string;
    url?: string;
  }>;
}

export function createSocialMediaPostService(): SocialMediaPostService {
  const { createSocialPublisherService } = require("./SocialPublisherService");
  const {
    createSocialMediaPostRepository,
  } = require("../repositories/SocialMediaPostRepository");
  const { db } = require("../db/connection");
  const publisher = createSocialPublisherService();
  const repo = createSocialMediaPostRepository({ db });
  return {
    async list(params: ListParams): Promise<ListResult> {
      const page = params.page && params.page > 0 ? params.page : 1;
      const pageSize =
        params.pageSize && params.pageSize > 0 ? params.pageSize : 10;

      const where = params.platform
        ? eq(socialMediaPosts.platform, params.platform)
        : undefined;

      const [{ total }] = await db!
        .select({ total: count() })
        .from(socialMediaPosts)
        .where(where as any);

      const items = await db!
        .select()
        .from(socialMediaPosts)
        .where(where as any)
        .orderBy(desc(socialMediaPosts.createdAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      return { items, total: Number(total), page, pageSize };
    },
    async publish(id: string) {
      const post = await repo.findById(id);
      if (!post) throw new Error("Social media post not found");
      const result = await publisher.publish(post);
      // Mark as published on successful platform publish
      await repo.markPublished(id);
      return {
        success: true,
        platform: result.platform,
        platformPostId: result.platformPostId,
        url: result.url,
      };
    },
  };
}
