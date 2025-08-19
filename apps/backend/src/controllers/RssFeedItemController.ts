import type { RssFeedItemService } from '../services/RssFeedItemService'

export interface RssFeedItemController {
  listAll(params: {
    page?: number
    pageSize?: number
    search?: string
    sort?: 'asc' | 'desc'
  }): Promise<{
    items: any[]
    total: number
    page: number
    pageSize: number
  }>
}

interface Dependencies {
  rssFeedItemService: RssFeedItemService
}

export function createRssFeedItemController({ rssFeedItemService }: Dependencies): RssFeedItemController {
  return {
    async listAll(params) {
      const { page = 1, pageSize = 10, search, sort = 'desc' } = params
      return rssFeedItemService.listAll({ page, pageSize, search, sort })
    }
  }
}
