import { FastifyRequest, FastifyReply } from 'fastify'
import { GenerateContentService } from '../services/GenerateContentService'
import { 
  GenerateContentRequestDto, 
  GenerateContentResponseDto 
} from '../types/dtos'

export interface GenerateContentController {
  generateContent(request: FastifyRequest, reply: FastifyReply): Promise<void>
}

interface Dependencies {
  generateContentService: GenerateContentService
}

export function createGenerateContentController({ generateContentService }: Dependencies): GenerateContentController {
  if (!generateContentService) {
    throw new Error('generateContentService is required for generateContentController')
  }
  
  return {
    async generateContent(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      try {
        const requestData = request.body as GenerateContentRequestDto
        const result: GenerateContentResponseDto = await generateContentService.generateContent(requestData)
        
        reply.code(200).send({
          success: true,
          data: result
        })
      } catch (error) {
        reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Bad request'
        })
      }
    }
  }
}
