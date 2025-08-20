import { db } from '../db'
import { socialMediaPosts, type SocialMediaPost } from '../db/schema'
import { and, desc, eq, count } from 'drizzle-orm'

export interface ListParams {
  platform?: 'instagram' | 'twitter'
  page?: number
  pageSize?: number
}

export interface ListResult {
  items: SocialMediaPost[]
  total: number
  page: number
  pageSize: number
}

export interface SocialMediaPostService {
  list(params: ListParams): Promise<ListResult>
}

export function createSocialMediaPostService(): SocialMediaPostService {
  return {
    async list(params: ListParams): Promise<ListResult> {
      const page = params.page && params.page > 0 ? params.page : 1
      const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : 10

      const where = params.platform ? eq(socialMediaPosts.platform, params.platform) : undefined

      const [{ total }] = await db
        .select({ total: count() })
        .from(socialMediaPosts)
        .where(where as any)

      const items = await db
        .select()
        .from(socialMediaPosts)
        .where(where as any)
        .orderBy(desc(socialMediaPosts.createdAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize)

      return { items, total: Number(total), page, pageSize }
    }
  }
}


