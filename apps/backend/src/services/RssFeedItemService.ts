import type { AppRedisClient } from '../config/redis'
import type { RssFeedItemRepository, ListAllParams, ListResult } from '../repositories/RssFeedItemRepository'

export interface RssFeedItemService {
  listAll(params: Partial<ListAllParams>): Promise<ListResult>
}

interface Dependencies {
  rssFeedItemRepository: RssFeedItemRepository
  redis: AppRedisClient | null
}

export function createRssFeedItemService({ rssFeedItemRepository, redis }: Dependencies): RssFeedItemService {
  const LIST_CACHE_PREFIX = 'rss:items:list:'
  const LIST_CACHE_TTL_SECONDS = 60

  return {
    async listAll(params: Partial<ListAllParams>): Promise<ListResult> {
      const page = params.page ?? 1
      const pageSize = params.pageSize ?? 10
      const search = params.search
      const sort = params.sort ?? 'desc'

      const cacheKey = `${LIST_CACHE_PREFIX}${page}:${pageSize}:${search ?? ''}:${sort}`

      if (redis) {
        try {
          const raw = await redis.get(cacheKey)
          if (raw) return JSON.parse(raw) as ListResult
        } catch {
          // Ignore cache errors
        }
      }

      const result = await rssFeedItemRepository.listAll({ page, pageSize, search, sort })

      if (redis) {
        try {
          await redis.set(cacheKey, JSON.stringify(result), { EX: LIST_CACHE_TTL_SECONDS })
        } catch {
          // Ignore cache errors
        }
      }

      return result
    }
  }
}

export type { ListAllParams, ListResult }
