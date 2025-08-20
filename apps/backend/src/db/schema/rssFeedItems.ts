import { pgTable, uuid, varchar, text, jsonb, timestamp, index, unique } from 'drizzle-orm/pg-core'
import { Type, Static } from '@sinclair/typebox'
import { rssFeeds } from './rssFeeds'

export const rssFeedItems = pgTable('rss_feed_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  feedId: uuid('feed_id').notNull().references(() => rssFeeds.id, { onDelete: 'cascade' }),
  guid: varchar('guid', { length: 512 }),
  title: varchar('title', { length: 512 }).notNull(),
  link: varchar('link', { length: 1024 }).notNull(),
  summary: text('summary'),
  content: text('content'),
  imageUrl: varchar('image_url', { length: 1024 }),
  author: varchar('author', { length: 255 }),
  categories: jsonb('categories').$type<string[]>().notNull().default([]),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  fetchedAt: timestamp('fetched_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  feedIdIdx: index('idx_rss_feed_items_feed_id').on(table.feedId),
  publishedAtIdx: index('idx_rss_feed_items_published_at').on(table.publishedAt.desc()),
  fetchedAtIdx: index('idx_rss_feed_items_fetched_at').on(table.fetchedAt.desc()),
  guidUnique: unique('uq_rss_feed_items_feed_guid').on(table.feedId, table.guid),
  linkUnique: unique('uq_rss_feed_items_feed_link').on(table.feedId, table.link),
}))

export const insertRssFeedItemSchema = Type.Object({
  feedId: Type.String({ format: 'uuid' }),
  guid: Type.Optional(Type.String({ maxLength: 512 })),
  title: Type.String({ minLength: 1, maxLength: 512 }),
  link: Type.String({ format: 'uri', maxLength: 1024 }),
  summary: Type.Optional(Type.String()),
  content: Type.Optional(Type.String()),
  author: Type.Optional(Type.String({ maxLength: 255 })),
  categories: Type.Optional(Type.Array(Type.String())),
  publishedAt: Type.Optional(Type.String({ format: 'date-time' })),
})

export const selectRssFeedItemSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  feedId: Type.String({ format: 'uuid' }),
  guid: Type.Optional(Type.String()),
  title: Type.String(),
  link: Type.String({ format: 'uri' }),
  summary: Type.Optional(Type.String()),
  content: Type.Optional(Type.String()),
  author: Type.Optional(Type.String()),
  categories: Type.Array(Type.String()),
  publishedAt: Type.Optional(Type.String({ format: 'date-time' })),
  fetchedAt: Type.String({ format: 'date-time' }),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
})

export const updateRssFeedItemSchema = Type.Partial(insertRssFeedItemSchema)

export type RssFeedItem = typeof rssFeedItems.$inferSelect
export type NewRssFeedItem = typeof rssFeedItems.$inferInsert
export type UpdateRssFeedItem = Partial<NewRssFeedItem>

export type InsertRssFeedItemType = Static<typeof insertRssFeedItemSchema>
export type SelectRssFeedItemType = Static<typeof selectRssFeedItemSchema>
export type UpdateRssFeedItemType = Static<typeof updateRssFeedItemSchema>


