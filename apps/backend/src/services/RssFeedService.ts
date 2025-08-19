import type { AppRedisClient } from '../config/redis'
import type { RssFeedRepository, ListParams, ListResult } from '../repositories/RssFeedRepository'
import type { NewRssFeed, RssFeed } from '../db/schema'

export interface RssFeedService {
  create(data: NewRssFeed): Promise<RssFeed>
  list(params: Partial<ListParams>): Promise<ListResult>
  update(id: string, data: Partial<NewRssFeed>): Promise<RssFeed | null>
  delete(id: string): Promise<boolean>
}

interface Dependencies {
  rssFeedRepository: RssFeedRepository
  redis: AppRedisClient | null
}

export function createRssFeedService({ rssFeedRepository, redis }: Dependencies): RssFeedService {
  const LIST_CACHE_PREFIX = 'rss:feeds:list:'
  const LIST_CACHE_TTL_SECONDS = 60

  async function invalidateListCaches(): Promise<void> {
    if (!redis) return
    try {
      const batch: string[] = []
      for await (const key of redis.scanIterator({ MATCH: `${LIST_CACHE_PREFIX}*`, COUNT: 100 })) {
        batch.push(String(key))
        if (batch.length >= 200) {
          await redis.del(batch)
          batch.length = 0
        }
      }
      if (batch.length) await redis.del(batch)
    } catch {
      // ignore cache errors
    }
  }

  return {
    async create(data: NewRssFeed): Promise<RssFeed> {
      const created = await rssFeedRepository.create(data)
      await invalidateListCaches()
      return created
    },

    async list(params: Partial<ListParams>): Promise<ListResult> {
      const page = params.page ?? 1
      const pageSize = params.pageSize ?? 10
      const search = params.search
      const sort = params.sort ?? 'desc'

      const cacheKey = `${LIST_CACHE_PREFIX}${page}:${pageSize}:${search ?? ''}:${sort}`

      if (redis) {
        try {
          const raw = await redis.get(cacheKey)
          if (raw) return JSON.parse(raw) as ListResult
        } catch {}
      }

      const result = await rssFeedRepository.list({ page, pageSize, search, sort })

      if (redis) {
        try {
          await redis.set(cacheKey, JSON.stringify(result), { EX: LIST_CACHE_TTL_SECONDS })
        } catch {}
      }

      return result
    },

    async update(id: string, data: Partial<NewRssFeed>): Promise<RssFeed | null> {
      const updated = await rssFeedRepository.update(id, data)
      if (updated) await invalidateListCaches()
      return updated
    },

    async delete(id: string): Promise<boolean> {
      const ok = await rssFeedRepository.delete(id)
      if (ok) await invalidateListCaches()
      return ok
    }
  }
}

export type { ListParams, ListResult }


