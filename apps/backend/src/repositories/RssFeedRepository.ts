import { db } from '../db'
import { rssFeeds, type RssFeed, type NewRssFeed } from '../db/schema'
import { count, ilike, desc, asc, eq } from 'drizzle-orm'

export interface RssFeedRepository {
  create(data: NewRssFeed): Promise<RssFeed>
  list(params: ListParams): Promise<ListResult>
  update(id: string, data: Partial<NewRssFeed>): Promise<RssFeed | null>
  delete(id: string): Promise<boolean>
}

export interface ListParams {
  page: number
  pageSize: number
  search?: string
  sort?: 'asc' | 'desc'
}

export interface ListResult {
  items: RssFeed[]
  total: number
  page: number
  pageSize: number
}

interface Dependencies {
  db: typeof db
}

export function createRssFeedRepository({ db }: Dependencies): RssFeedRepository {
  if (!db) throw new Error('db is required for rssFeedRepository')

  return {
    async create(data: NewRssFeed): Promise<RssFeed> {
      const [row] = await db.insert(rssFeeds).values(data).returning()
      if (!row) throw new Error('Failed to create RSS feed')
      return row
    },
    async list(params: ListParams): Promise<ListResult> {
      const { page, pageSize, search, sort = 'desc' } = params

      const where = search && search.trim().length
        ? ilike(rssFeeds.feedName, `%${search.trim()}%`)
        : undefined

      const [{ total }] = await db
        .select({ total: count() })
        .from(rssFeeds)
        .where(where as any)

      const items = await db
        .select()
        .from(rssFeeds)
        .where(where as any)
        .orderBy(sort === 'asc' ? asc(rssFeeds.createdAt) : desc(rssFeeds.createdAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize)

      return { items, total: Number(total), page, pageSize }
    },
    async update(id: string, data: Partial<NewRssFeed>): Promise<RssFeed | null> {
      if (!id) return null
      const [row] = await db.update(rssFeeds).set(data).where(eq(rssFeeds.id, id)).returning()
      return row ?? null
    },
    async delete(id: string): Promise<boolean> {
      if (!id) return false
      const rows = await db.delete(rssFeeds).where(eq(rssFeeds.id, id)).returning()
      return rows.length > 0
    }
  }
}
