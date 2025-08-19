import { FastifyPluginAsync } from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import '../../types/container'
import { insertRssFeedSchema, updateRssFeedSchema } from '../../db/schema/rssFeeds'

const rssFeedsRoutes: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>()

  // Create RSS feed
  server.route({
    method: 'POST',
    url: '/',
    schema: {
      body: insertRssFeedSchema,
      response: {
        201: Type.Object({ success: Type.Boolean(), data: Type.Any() }),
        400: Type.Object({ success: Type.Boolean(), error: Type.String() })
      }
    },
    handler: async (request, reply) => {
      const body = request.body as any
      const { rssFeedRepository } = fastify.diContainer.cradle
      const created = await rssFeedRepository.create(body)
      return reply.code(201).send({ success: true, data: created })
    }
  })

  // List RSS feeds with pagination and search by feedName
  server.route({
    method: 'GET',
    url: '/',
    schema: {
      querystring: Type.Object({
        page: Type.Optional(Type.Number({ default: 1 })),
        pageSize: Type.Optional(Type.Number({ default: 10 })),
        search: Type.Optional(Type.String()),
        sort: Type.Optional(Type.Union([Type.Literal('asc'), Type.Literal('desc')], { default: 'desc' }))
      }),
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          data: Type.Object({
            items: Type.Array(Type.Any()),
            total: Type.Number(),
            page: Type.Number(),
            pageSize: Type.Number()
          })
        })
      }
    },
    handler: async (request, reply) => {
      const { page = 1, pageSize = 10, search, sort = 'desc' } = request.query as any
      const { rssFeedRepository } = fastify.diContainer.cradle
      const result = await rssFeedRepository.list({ page, pageSize, search, sort })
      return reply.code(200).send({ success: true, data: result })
    }
  })

  // Update RSS feed by id
  server.route({
    method: 'PUT',
    url: '/:id',
    schema: {
      params: Type.Object({ id: Type.String({ format: 'uuid' }) }),
      body: updateRssFeedSchema,
      response: {
        200: Type.Object({ success: Type.Boolean(), data: Type.Any() }),
        400: Type.Object({ success: Type.Boolean(), error: Type.String() }),
        404: Type.Object({ success: Type.Boolean(), error: Type.String() })
      }
    },
    handler: async (request, reply) => {
      const { id } = request.params as { id: string }
      const body = request.body as any
      const { rssFeedRepository } = fastify.diContainer.cradle
      const updated = await rssFeedRepository.update(id, body)
      if (!updated) return reply.code(404).send({ success: false, error: 'Not found' })
      return reply.code(200).send({ success: true, data: updated })
    }
  })

  // Delete RSS feed by id
  server.route({
    method: 'DELETE',
    url: '/:id',
    schema: {
      params: Type.Object({ id: Type.String({ format: 'uuid' }) }),
      response: {
        200: Type.Object({ success: Type.Boolean(), message: Type.String() }),
        404: Type.Object({ success: Type.Boolean(), error: Type.String() })
      }
    },
    handler: async (request, reply) => {
      const { id } = request.params as { id: string }
      const { rssFeedRepository } = fastify.diContainer.cradle
      const ok = await rssFeedRepository.delete(id)
      if (!ok) return reply.code(404).send({ success: false, error: 'Not found' })
      return reply.code(200).send({ success: true, message: 'Deleted' })
    }
  })
}

export default rssFeedsRoutes
