import { db } from '../db'
import { rssFeedItems, type RssFeedItem, type NewRssFeedItem } from '../db/schema'
import { count, eq, and, desc, asc } from 'drizzle-orm'

export interface RssFeedItemRepository {
  create(data: NewRssFeedItem): Promise<RssFeedItem>
  createMany(items: NewRssFeedItem[]): Promise<RssFeedItem[]>
  getByGuid(feedId: string, guid: string): Promise<RssFeedItem | null>
  getByTitle(feedId: string, title: string): Promise<RssFeedItem | null>
  list(params: ListParams): Promise<ListResult>
}

export interface ListParams {
  feedId: string
  page: number
  pageSize: number
  sort?: 'asc' | 'desc'
}

export interface ListResult {
  items: RssFeedItem[]
  total: number
  page: number
  pageSize: number
}

interface Dependencies {
  db: typeof db
}

export function createRssFeedItemRepository({ db }: Dependencies): RssFeedItemRepository {
  if (!db) throw new Error('db is required for rssFeedItemRepository')

  return {
    async create(data: NewRssFeedItem): Promise<RssFeedItem> {
      const [row] = await db.insert(rssFeedItems).values(data).returning()
      if (!row) throw new Error('Failed to create RSS feed item')
      return row
    },
    
    async createMany(items: NewRssFeedItem[]): Promise<RssFeedItem[]> {
      if (items.length === 0) return []
      const rows = await db.insert(rssFeedItems).values(items).returning()
      return rows
    },
    
    async getByGuid(feedId: string, guid: string): Promise<RssFeedItem | null> {
      if (!feedId || !guid) return null
      const [row] = await db
        .select()
        .from(rssFeedItems)
        .where(and(
          eq(rssFeedItems.feedId, feedId),
          eq(rssFeedItems.guid, guid)
        ))
        .limit(1)
      return row ?? null
    },
    
    async getByTitle(feedId: string, title: string): Promise<RssFeedItem | null> {
      if (!feedId || !title) return null
      const [row] = await db
        .select()
        .from(rssFeedItems)
        .where(and(
          eq(rssFeedItems.feedId, feedId),
          eq(rssFeedItems.title, title)
        ))
        .limit(1)
      return row ?? null
    },
    
    async list(params: ListParams): Promise<ListResult> {
      const { feedId, page, pageSize, sort = 'desc' } = params
      
      const [{ total }] = await db
        .select({ total: count() })
        .from(rssFeedItems)
        .where(eq(rssFeedItems.feedId, feedId))
      
      const items = await db
        .select()
        .from(rssFeedItems)
        .where(eq(rssFeedItems.feedId, feedId))
        .orderBy(sort === 'asc' ? asc(rssFeedItems.publishedAt) : desc(rssFeedItems.publishedAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize)
      
      return { items, total: Number(total), page, pageSize }
    }
  }
}
