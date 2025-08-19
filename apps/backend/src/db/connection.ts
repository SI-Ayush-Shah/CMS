import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'
import { env } from '../config/env'

// Create connection only if DATABASE_URL is provided
let sql: ReturnType<typeof neon> | null = null
let db: ReturnType<typeof drizzle> | null = null

if (env.DATABASE_URL) {
  const neonSql = neon(env.DATABASE_URL)

  // Backward-compat wrapper: route conventional calls to .query(), keep tagged-template calls intact
  const compatSql: any = (...args: any[]) => {
    const first = args[0]
    if (Array.isArray(first) && Object.prototype.hasOwnProperty.call(first, 'raw')) return (neonSql as any)(...args)
    return (neonSql as any).query(...args)
  }
  compatSql.query = (neonSql as any).query.bind(neonSql)

  sql = compatSql as ReturnType<typeof neon>

  db = drizzle(sql, {
    schema,
    casing: 'snake_case'
  })
} else {
  console.warn('⚠️ DATABASE_URL not provided - database features will be disabled')
}

export { sql, db }
