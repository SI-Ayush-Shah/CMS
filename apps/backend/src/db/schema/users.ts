import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core'
import { Type, Static } from '@sinclair/typebox'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// TypeBox schemas for validation
export const insertUserSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  name: Type.String({ minLength: 1 }),
})

export const selectUserSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  email: Type.String({ format: 'email' }),
  name: Type.String(),
  createdAt: Type.String({ format: 'date-time' }),
})

export const updateUserSchema = Type.Partial(insertUserSchema)

// TypeScript types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type UpdateUser = Partial<NewUser>

// TypeBox derived types
export type InsertUserType = Static<typeof insertUserSchema>
export type SelectUserType = Static<typeof selectUserSchema>
export type UpdateUserType = Static<typeof updateUserSchema>
