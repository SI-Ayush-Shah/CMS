/**
 * Database setup script using Drizzle ORM
 * Run this script to set up your database schema and add sample data
 */

import { db, sql } from '../db'
import { users } from '../db/schema'
import { count } from 'drizzle-orm'
import { env } from '../config/env'

async function setupDatabase() {
  if (!db || !sql) {
    console.error('❌ Database not available - DATABASE_URL environment variable is required')
    process.exit(1)
  }

  try {
    console.log('Setting up database tables using Drizzle...')

    // Create tables using raw SQL (since we're not using migrations yet)
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Create indexes for better performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)
    `

    console.log('✅ Database tables created successfully!')

    // Insert some sample data if the table is empty using Drizzle
    const userCount = await db.select({ count: count() }).from(users)
    const totalUsers = userCount[0].count

    if (totalUsers === 0) {
      console.log('Adding sample users...')
      
      await db.insert(users).values([
        { email: 'john@example.com', name: 'John Doe' },
        { email: 'jane@example.com', name: 'Jane Smith' }
      ])
      
      console.log('✅ Sample users added!')
    }

    console.log('🎉 Database setup completed successfully!')
    
  } catch (error) {
    console.error('❌ Error setting up database:', error)
    throw error
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { setupDatabase }
