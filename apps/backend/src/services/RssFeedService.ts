import type { AppRedisClient } from '../config/redis'
import type { RssFeedRepository, ListParams, ListResult } from '../repositories/RssFeedRepository'
import type { NewRssFeed, RssFeed } from '../db/schema'
import { rssSchedulerQueue } from '../background-processes/rss-scheduler/queues'
import { minutesToMs, hoursToMs } from '../shared/utils/commonFunctions'

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

  async function removeRepeatForFeed(feedId: string) {
    // 1. Construct the EXACT same scheduler ID string
    const schedulerId = `feed:${feedId}`;
  
    console.log(`Attempting to remove scheduler with ID: ${schedulerId}`);
    // 2. Use that full ID to remove the job
    // NOTE: The function name depends on your library. 
    // For BullMQ, it's often removeRepeatableByKey.
    const result = await rssSchedulerQueue.removeJobScheduler(schedulerId);
  
    if (result) {
      console.log(`Successfully removed scheduler: ${schedulerId}`);
    } else {
      console.log(`Could not find scheduler to remove: ${schedulerId}`);
    }
  }

  function getEveryMs(interval: RssFeed['updateInterval']): number {
    const map: Record<string, number> = {
      '15_minutes': minutesToMs({ minutes: 15 }).milliseconds,
      '30_minutes': minutesToMs({ minutes: 30 }).milliseconds,
      '1_hour': hoursToMs({ hours: 1 }).milliseconds,
      '2_hours': hoursToMs({ hours: 2 }).milliseconds,
      '6_hours': hoursToMs({ hours: 6 }).milliseconds,
      '12_hours': hoursToMs({ hours: 12 }).milliseconds,
      '24_hours': hoursToMs({ hours: 24 }).milliseconds
    }
    return map[interval] ?? hoursToMs({ hours: 1 }).milliseconds
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
      const previous = await rssFeedRepository.getById(id)
      const updated = await rssFeedRepository.update(id, data)
      if (updated) {
        await invalidateListCaches()
        if (previous && previous.isActive === false && updated.isActive === true) {
          console.log('RSS feed activated', { id: updated.id, feedName: updated.feedName })
          const everyMs = getEveryMs(updated.updateInterval)
          await removeRepeatForFeed(updated.id)
          await rssSchedulerQueue.add('scrape-feed', { ...updated }, {
            repeat: { every: 10000 },
            jobId: `feed:${updated.id}`,
            repeatJobKey: `feed:${updated.id}`,
            removeOnComplete: true,
            removeOnFail: 100,
          })
        }

        if (previous && previous.isActive === true && updated.isActive === false) {
          console.log('RSS feed deactivated', { id: updated.id, feedName: updated.feedName })
          await removeRepeatForFeed(updated.id)
        }
      }
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


