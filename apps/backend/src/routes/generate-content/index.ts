import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type, Static } from '@sinclair/typebox'
import '../../types/container' // Import type declarations

// Import DTOs from dedicated DTOs location (barrel export)
import {
  GenerateContentRequestSchema,
  GenerateContentResponseSchema,
  GenerateContentRequestDto,
  GenerateContentResponseDto
} from '../../types/dtos'

// API Response Wrapper Schemas
const GenerateContentApiResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: GenerateContentResponseSchema // Use DTO schema from service
})

const ErrorResponseSchema = Type.Object({
  success: Type.Boolean(),
  error: Type.String()
})

// TypeScript types (auto-generated from schemas)
export type GenerateContentApiResponse = Static<typeof GenerateContentApiResponseSchema>
export type ErrorResponse = Static<typeof ErrorResponseSchema>

// Re-export DTOs from service
export type {
  GenerateContentRequestDto,
  GenerateContentResponseDto
}

// Export schemas for shared usage
export {
  GenerateContentRequestSchema,
  GenerateContentApiResponseSchema,
  ErrorResponseSchema
}

const generateContentRoutes: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>()

  // POST /generate-content - Generate content
  server.route({
    method: 'POST',
    url: '/',
    schema: {
      // Accept both multipart form-data (files + content field) and JSON body
      consumes: ['multipart/form-data', 'application/json'],
      response: {
        200: GenerateContentApiResponseSchema, // Wraps DTO with API response format
        400: ErrorResponseSchema,
        500: ErrorResponseSchema
      }
    },
    handler: async (request, reply) => {
      const { generateContentController } = fastify.diContainer.cradle
      return generateContentController.generateContent(request, reply)
    }
  })

  // GET /generate-content - Paginated list with filters/sort
  server.route({
    method: 'GET',
    url: '/',
    schema: {
      querystring: Type.Object({
        page: Type.Optional(Type.Number({ default: 1 })),
        pageSize: Type.Optional(Type.Number({ default: 10 })),
        status: Type.Optional(Type.Union([Type.Literal('draft'), Type.Literal('published')])),
        category: Type.Optional(Type.String()),
        categories: Type.Optional(Type.Array(Type.String())),
        tags: Type.Optional(Type.Array(Type.String())),
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
        }),
        400: ErrorResponseSchema
      }
    },
    handler: async (request, reply) => {
      const { generatedContentRepository } = fastify.diContainer.cradle
      const { page = 1, pageSize = 10, status, category, categories, tags, sort = 'desc' } = request.query as any
      const result = await generatedContentRepository.list({ page, pageSize, status, category, categories, tags, sort })
      return reply.code(200).send({ success: true, data: result })
    }
  })

  // PATCH /generate-content/:id - Update selected fields
  server.route({
    method: 'PATCH',
    url: '/:id',
    schema: {
      params: Type.Object({ id: Type.String({ format: 'uuid' }) }),
      body: (await import('../../types/dtos/generate-content')).PatchGeneratedContentSchema,
      response: {
        200: Type.Object({ success: Type.Boolean(), data: Type.Any() }),
        404: ErrorResponseSchema,
        400: ErrorResponseSchema
      }
    },
    handler: async (request, reply) => {
      const { id } = request.params as { id: string }
      const body = request.body as any
      const { generatedContentRepository } = fastify.diContainer.cradle
      const updated = await generatedContentRepository.update(id, body)
      if (!updated) return reply.code(404).send({ success: false, error: 'Not found' })
      return reply.code(200).send({ success: true, data: updated })
    }
  })
}

export default generateContentRoutes
