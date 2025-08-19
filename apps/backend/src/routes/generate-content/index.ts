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
}

export default generateContentRoutes
