import { FastifyPluginAsync } from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import '../../types/container'

const rssItemsRoutes: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>()

  // List all RSS items with pagination and search
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
      const { rssFeedItemController } = fastify.diContainer.cradle
      const result = await rssFeedItemController.listAll({ page, pageSize, search, sort })
      return reply.code(200).send({ success: true, data: result })
    }
  })
}

export default rssItemsRoutes
