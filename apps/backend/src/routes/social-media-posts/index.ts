import { FastifyPluginAsync } from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import '../../types/container'
import { createSocialMediaPostController } from '../../controllers/SocialMediaPostController'

const socialMediaPostsRoutes: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>()
  const controller = createSocialMediaPostController()

  server.route({
    method: 'GET',
    url: '/',
    schema: {
      querystring: Type.Object({
        platform: Type.Optional(Type.Union([Type.Literal('instagram'), Type.Literal('twitter')])),
        page: Type.Optional(Type.Number({ default: 1 })),
        pageSize: Type.Optional(Type.Number({ default: 10 })),
      }),
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          data: Type.Object({
            items: Type.Array(Type.Any()),
            total: Type.Number(),
            page: Type.Number(),
            pageSize: Type.Number(),
          })
        })
      }
    },
    handler: (request, reply) => controller.list(request, reply)
  })
}

export default socialMediaPostsRoutes


