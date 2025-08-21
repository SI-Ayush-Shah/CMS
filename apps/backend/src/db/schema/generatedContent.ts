import {
  pgTable,
  uuid,
  varchar,
  jsonb,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { Type, Static } from "@sinclair/typebox";

export const contentStatus = pgEnum("content_status", ["draft", "published"]);

export const generatedContents = pgTable("generated_contents", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: varchar("summary", { length: 1024 }).notNull(),
  category: varchar("category", { length: 128 }).notNull(),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  // bannerUrl: varchar("banner", { length: 255 }),
  // images: jsonb("images").$type<string[]>().notNull().default([]),
  // Editor.js body stored as JSON
<<<<<<< HEAD
  body: jsonb("body").$type<Record<string, unknown>>().notNull(),
  status: contentStatus("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
=======
  body: jsonb('body').$type<Record<string, unknown>>().notNull(),
  images: jsonb('images').$type<string[]>().notNull().default([]),
  bannerUrl: varchar('banner_url', { length: 1024 }),
  status: contentStatus('status').notNull().default('draft'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})
>>>>>>> 773ee37cc085e2a4a3b48c83bf00005ea44bec51

// TypeBox schemas
export const insertGeneratedContentSchema = Type.Object({
  title: Type.String({ minLength: 1 }),
  summary: Type.String({ minLength: 1 }),
  category: Type.String({ minLength: 1 }),
  tags: Type.Array(Type.String()),
  body: Type.Record(Type.String(), Type.Any()),
<<<<<<< HEAD
  status: Type.Optional(
    Type.Union([Type.Literal("draft"), Type.Literal("published")], {
      default: "draft",
    })
  ),
});
=======
  images: Type.Optional(Type.Array(Type.String())),
  bannerUrl: Type.Optional(Type.String({ format: 'uri' })),
  status: Type.Optional(Type.Union([Type.Literal('draft'), Type.Literal('published')], { default: 'draft' }))
})
>>>>>>> 773ee37cc085e2a4a3b48c83bf00005ea44bec51

export const selectGeneratedContentSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  title: Type.String(),
  summary: Type.String(),
  category: Type.String(),
  tags: Type.Array(Type.String()),
  body: Type.Record(Type.String(), Type.Any()),
<<<<<<< HEAD
  status: Type.Union([Type.Literal("draft"), Type.Literal("published")]),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});
=======
  images: Type.Array(Type.String()),
  bannerUrl: Type.Union([Type.String({ format: 'uri' }), Type.Null()]),
  status: Type.Union([Type.Literal('draft'), Type.Literal('published')]),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
})
>>>>>>> 773ee37cc085e2a4a3b48c83bf00005ea44bec51

export const updateGeneratedContentSchema = Type.Partial(
  insertGeneratedContentSchema
);

// Drizzle inferred types
export type GeneratedContent = typeof generatedContents.$inferSelect;
export type NewGeneratedContent = typeof generatedContents.$inferInsert;
export type UpdateGeneratedContent = Partial<NewGeneratedContent>;

// TypeBox derived types
export type InsertGeneratedContentType = Static<
  typeof insertGeneratedContentSchema
>;
export type SelectGeneratedContentType = Static<
  typeof selectGeneratedContentSchema
>;
export type UpdateGeneratedContentType = Static<
  typeof updateGeneratedContentSchema
>;
