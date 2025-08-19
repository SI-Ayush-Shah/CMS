import { db, sql } from './connection'

export { db, sql } from './connection'
export * from './schema'

// Re-add DatabaseConnection interface and createDatabaseConnection function for compatibility
export interface DatabaseConnection {
  readonly db: typeof db
  readonly sql: typeof sql
}

export function createDatabaseConnection({}: {} = {}): DatabaseConnection {
  if (!db || !sql) {
    throw new Error('Database not available - DATABASE_URL environment variable is required')
  }
  
  return {
    db,
    sql,
  }
}
