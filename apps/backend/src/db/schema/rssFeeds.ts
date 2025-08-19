import { pgTable, uuid, varchar, timestamp, pgEnum, boolean } from 'drizzle-orm/pg-core'
import { Type, Static } from '@sinclair/typebox'

// Enum for update intervals
export const rssUpdateInterval = pgEnum('rss_update_interval', [
  '15_minutes',
  '30_minutes',
  '1_hour',
  '2_hours',
  '6_hours',
  '12_hours',
  '24_hours'
])

export const rssFeeds = pgTable('rss_feeds', {
  id: uuid('id').primaryKey().defaultRandom(),
  feedName: varchar('feed_name', { length: 255 }).notNull(),
  feedSourceUrl: varchar('feed_source_url', { length: 1024 }).notNull(),
  updateInterval: rssUpdateInterval('update_interval').notNull().default('1_hour'),
  isActive: boolean('is_active').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// TypeBox schemas
export const insertRssFeedSchema = Type.Object({
  feedName: Type.String({ minLength: 1 }),
  feedSourceUrl: Type.String({ format: 'uri' }),
  updateInterval: Type.Union([
    Type.Literal('15_minutes'),
    Type.Literal('30_minutes'),
    Type.Literal('1_hour'),
    Type.Literal('2_hours'),
    Type.Literal('6_hours'),
    Type.Literal('12_hours'),
    Type.Literal('24_hours')
  ], { default: '1_hour' }),
  isActive: Type.Optional(Type.Boolean({ default: false }))
})

export const selectRssFeedSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  feedName: Type.String(),
  feedSourceUrl: Type.String({ format: 'uri' }),
  updateInterval: Type.Union([
    Type.Literal('15_minutes'),
    Type.Literal('30_minutes'),
    Type.Literal('1_hour'),
    Type.Literal('2_hours'),
    Type.Literal('6_hours'),
    Type.Literal('12_hours'),
    Type.Literal('24_hours')
  ]),
  isActive: Type.Boolean(),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' })
})

export const updateRssFeedSchema = Type.Partial(insertRssFeedSchema)

// Drizzle inferred types
export type RssFeed = typeof rssFeeds.$inferSelect
export type NewRssFeed = typeof rssFeeds.$inferInsert
export type UpdateRssFeed = Partial<NewRssFeed>

// TypeBox derived types
export type InsertRssFeedType = Static<typeof insertRssFeedSchema>
export type SelectRssFeedType = Static<typeof selectRssFeedSchema>
export type UpdateRssFeedType = Static<typeof updateRssFeedSchema>
