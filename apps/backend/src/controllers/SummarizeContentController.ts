import { FastifyRequest, FastifyReply } from 'fastify'
import { SummarizeContentService } from '../services/SummarizeContentService'
import { GenerateContentRequestDto, GenerateContentResponseDto } from '../types/dtos'
import { socialMediaGenerationQueue } from '../background-processes/social-media-generation/queues'
import { randomUUID } from 'crypto'

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
        const query = (request.query || {}) as Record<string, string | string[]>
        const isTwitter = String(query.twitter ?? '').toLowerCase() === 'true'
        const isInstagram = String(query.instagram ?? '').toLowerCase() === 'true'
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

        // Prepare job IDs so frontend can poll
        const twitterJobId = isTwitter ? randomUUID() : undefined
        const instagramJobId = isInstagram ? randomUUID() : undefined

        // Enqueue social media jobs if requested and retain completed jobs briefly to allow polling
        const jobs: Promise<any>[] = []
        if (twitterJobId) jobs.push(socialMediaGenerationQueue.add('generate-post', { platform: 'twitter', payload: result }, { jobId: twitterJobId, removeOnComplete: { age: 3600 }, removeOnFail: { age: 86400 } }))
        if (instagramJobId) jobs.push(socialMediaGenerationQueue.add('generate-post', { platform: 'instagram', payload: result }, { jobId: instagramJobId, removeOnComplete: { age: 3600 }, removeOnFail: { age: 86400 } }))
        if (jobs.length) await Promise.allSettled(jobs)

        reply.code(200).send({ 
          success: true, 
          data: result,
          jobs: {
            twitterJobId: twitterJobId || undefined,
            instagramJobId: instagramJobId || undefined,
          }
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


