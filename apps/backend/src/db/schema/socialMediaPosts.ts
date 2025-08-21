import {
  pgTable,
  uuid,
  varchar,
  text,
  jsonb,
  timestamp,
  index,
  pgEnum,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { Type, Static } from "@sinclair/typebox";
import { rssFeedItems } from "./rssFeedItems";

export const socialPlatform = pgEnum("social_platform", [
  "instagram",
  "twitter",
]);
export const socialStatus = pgEnum("social_status", ["draft", "published"]);

export const socialMediaPosts = pgTable(
  "social_media_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    platform: socialPlatform("platform").notNull(),
    text: text("text").notNull(),
    imageUrl: varchar("image_url", { length: 1024 }),
    hashtags: jsonb("hashtags").$type<string[]>().notNull().default([]),
    link: varchar("link", { length: 1024 }),
    status: socialStatus("status").notNull().default("draft"),
    feedItemId: uuid("feed_item_id").references(() => rssFeedItems.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    platformIdx: index("idx_social_media_posts_platform").on(table.platform),
    feedItemIdx: index("idx_social_media_posts_feed_item").on(table.feedItemId),
    instagramImageRequired: check(
      "chk_social_media_posts_instagram_image_required",
      sql`(platform <> 'instagram') OR (image_url IS NOT NULL)`
    ),
  })
);

export const insertSocialMediaPostSchema = Type.Object({
  platform: Type.Union([Type.Literal("instagram"), Type.Literal("twitter")]),
  text: Type.String({ minLength: 1 }),
  imageUrl: Type.Optional(Type.String({ format: "uri", maxLength: 1024 })),
  hashtags: Type.Optional(Type.Array(Type.String())),
  link: Type.Optional(Type.String({ format: "uri", maxLength: 1024 })),
  status: Type.Optional(
    Type.Union([Type.Literal("draft"), Type.Literal("published")])
  ),
  feedItemId: Type.Optional(Type.String({ format: "uuid" })),
});

export const selectSocialMediaPostSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  platform: Type.Union([Type.Literal("instagram"), Type.Literal("twitter")]),
  text: Type.String(),
  imageUrl: Type.Optional(Type.String({ format: "uri" })),
  hashtags: Type.Array(Type.String()),
  link: Type.Optional(Type.String({ format: "uri" })),
  status: Type.Union([Type.Literal("draft"), Type.Literal("published")]),
  feedItemId: Type.Optional(Type.String({ format: "uuid" })),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

export type SocialMediaPost = typeof socialMediaPosts.$inferSelect;
export type NewSocialMediaPost = typeof socialMediaPosts.$inferInsert;

export type InsertSocialMediaPostType = Static<
  typeof insertSocialMediaPostSchema
>;
export type SelectSocialMediaPostType = Static<
  typeof selectSocialMediaPostSchema
>;
