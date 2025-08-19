import { pgTable, uuid, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core'
import { Type, Static } from '@sinclair/typebox'

export const generatedContents = pgTable('generated_contents', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  summary: varchar('summary', { length: 1024 }).notNull(),
  category: varchar('category', { length: 128 }).notNull(),
  tags: jsonb('tags').$type<string[]>().notNull().default([]),
  // Editor.js body stored as JSON
  body: jsonb('body').$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// TypeBox schemas
export const insertGeneratedContentSchema = Type.Object({
  title: Type.String({ minLength: 1 }),
  summary: Type.String({ minLength: 1 }),
  category: Type.String({ minLength: 1 }),
  tags: Type.Array(Type.String()),
  body: Type.Record(Type.String(), Type.Any()),
})

export const selectGeneratedContentSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  title: Type.String(),
  summary: Type.String(),
  category: Type.String(),
  tags: Type.Array(Type.String()),
  body: Type.Record(Type.String(), Type.Any()),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
})

export const updateGeneratedContentSchema = Type.Partial(insertGeneratedContentSchema)

// Drizzle inferred types
export type GeneratedContent = typeof generatedContents.$inferSelect
export type NewGeneratedContent = typeof generatedContents.$inferInsert
export type UpdateGeneratedContent = Partial<NewGeneratedContent>

// TypeBox derived types
export type InsertGeneratedContentType = Static<typeof insertGeneratedContentSchema>
export type SelectGeneratedContentType = Static<typeof selectGeneratedContentSchema>
export type UpdateGeneratedContentType = Static<typeof updateGeneratedContentSchema>


