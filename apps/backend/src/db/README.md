# Database Layer

This folder contains all database-related code and configurations using **Drizzle ORM**.

## Structure

- `connection.ts` - Database connection setup using Neon + Drizzle ORM
- `schema/` - Database schema definitions
  - `users.ts` - User table schema
  - `index.ts` - Schema exports
- `migrations/` - Drizzle migration files
- `migrate.ts` - Migration runner
- `index.ts` - Main exports for the db module

## Usage

The database connection is automatically injected into repositories through the dependency injection container.

```typescript
// In a repository
interface Dependencies {
  databaseConnection: DatabaseConnection
}

export function createUserRepository({ databaseConnection }: Dependencies): UserRepository {
  const { db } = databaseConnection
  
  // Use Drizzle ORM for type-safe queries
  const allUsers = await db.select().from(users)
  const user = await db.insert(users).values({ email, name }).returning()
}
```

## Schema Management

All database schemas are defined using Drizzle ORM:

```typescript
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
```

## Environment Variables

Required environment variables:
- `DATABASE_URL` - Neon database connection string

## Available Scripts

- `npm run db:generate` - Generate migration files from schema changes
- `npm run db:migrate` - Run pending migrations  
- `npm run db:push` - Push schema changes directly to database
- `npm run db:studio` - Open Drizzle Studio for database management
- `npm run setup-db` - Set up database tables and sample data

## Setup

1. Create `.env` file with your Neon database URL
2. Generate and run migrations: `npm run db:generate && npm run db:migrate`
3. Or use the setup script: `npm run setup-db`

## Benefits

- ✅ **Type Safety** - Full TypeScript support with inferred types
- ✅ **SQL-like Syntax** - Familiar query builder API
- ✅ **Zero Runtime Dependencies** - Lightweight and fast
- ✅ **Zod Integration** - Built-in validation schemas
- ✅ **Migration System** - Version controlled schema changes
