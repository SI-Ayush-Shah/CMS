/**
 * Migration runner for Drizzle ORM
 * This script runs database migrations
 */

import { migrate } from 'drizzle-orm/neon-http/migrator'
import { db } from './connection'
import { env } from '../config/env'

async function runMigrations() {
  if (!db) {
    console.error('❌ Database not available - DATABASE_URL environment variable is required')
    process.exit(1)
  }

  try {
    console.log('Running database migrations...')
    
    await migrate(db, { migrationsFolder: './src/db/migrations' })
    
    console.log('✅ Migrations completed successfully!')
    
  } catch (error) {
    console.error('❌ Error running migrations:', error)
    throw error
  }
}

// Run migrations if this script is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { runMigrations }
