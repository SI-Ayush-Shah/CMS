import { FastifyRequest, FastifyReply } from 'fastify'
import { SummarizeContentService } from '../services/SummarizeContentService'
import { GenerateContentRequestDto, GenerateContentResponseDto } from '../types/dtos'

export interface SummarizeContentController {
  summarize(request: FastifyRequest, reply: FastifyReply): Promise<void>
}

interface Dependencies {
  summarizeContentService: SummarizeContentService
}

export function createSummarizeContentController({ summarizeContentService }: Dependencies): SummarizeContentController {
  if (!summarizeContentService) throw new Error('summarizeContentService is required')

  return {
    async summarize(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      try {
        // Support both JSON and multipart (bannerUrl as field if multipart)
        let requestData: GenerateContentRequestDto
        let bannerUrl: string | undefined
        let contentText = ''

        if ((request as any).isMultipart && (request as any).isMultipart()) {
          const parts = (request as any).parts()
          for await (const part of parts) {
            if (part.type === 'field') {
              if (part.fieldname === 'content') contentText = String(part.value || '')
              if (part.fieldname === 'bannerUrl') bannerUrl = String(part.value || '')
            }
          }
          requestData = { content: contentText, bannerUrl } as any
        } else {
          requestData = request.body as GenerateContentRequestDto
          bannerUrl = (requestData as any).bannerUrl as string | undefined
        }

        const result: GenerateContentResponseDto = await summarizeContentService.summarize({ ...requestData, bannerUrl } as any)

        reply.code(200).send({ success: true, data: result })
      } catch (error) {
        reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Bad request'
        })
      }
    }
  }
}


