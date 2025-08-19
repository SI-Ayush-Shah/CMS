import { db } from '../db'
import { users, type User, type NewUser, type UpdateUser } from '../db/schema'
import { eq, desc } from 'drizzle-orm'

export interface UserRepository {
  findAll(): Promise<User[]>
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(userData: NewUser): Promise<User>
  update(id: string, userData: UpdateUser): Promise<User | null>
  delete(id: string): Promise<boolean>
}

interface Dependencies {
  db: typeof db
}

export function createUserRepository({ db }: Dependencies): UserRepository {
  if (!db) {
    throw new Error('db is required for userRepository')
  }


  return {
    async findAll(): Promise<User[]> {


      return await db.select().from(users).orderBy(desc(users.createdAt))
    },

    async findById(id: string): Promise<User | null> {
      if (!id) return null
      
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1)
      return result[0] || null
    },

    async findByEmail(email: string): Promise<User | null> {
      if (!email) return null
      
      const result = await db.select().from(users).where(eq(users.email, email)).limit(1)
      return result[0] || null
    },

    async create(userData: NewUser): Promise<User> {
      const result = await db.insert(users).values(userData).returning()
      
      if (result.length === 0) {
        throw new Error('Failed to create user')
      }
      
      return result[0]
    },

    async update(id: string, userData: UpdateUser): Promise<User | null> {
      if (!id) return null
      
      if (!userData.email && !userData.name) {
        // No fields to update, return existing user
        return this.findById(id)
      }
      
      const result = await db.update(users)
        .set(userData)
        .where(eq(users.id, id))
        .returning()
      
      return result[0] || null
    },

    async delete(id: string): Promise<boolean> {
      if (!id) return false
      
      const result = await db.delete(users).where(eq(users.id, id)).returning()
      return result.length > 0
    }
  }
}
