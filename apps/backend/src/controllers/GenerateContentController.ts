import { FastifyRequest, FastifyReply } from 'fastify'
import { GenerateContentService } from '../services/GenerateContentService'
import { CloudinaryService } from '../services/CloudinaryService'
import { 
  GenerateContentRequestDto, 
  GenerateContentResponseDto 
} from '../types/dtos'
import { socialMediaGenerationQueue } from '../background-processes/social-media-generation/queues'
import { randomUUID } from 'crypto'

export interface GenerateContentController {
  generateContent(request: FastifyRequest, reply: FastifyReply): Promise<void>
}

interface Dependencies {
  generateContentService: GenerateContentService
  cloudinaryService: CloudinaryService
}

export function createGenerateContentController({ generateContentService, cloudinaryService }: Dependencies): GenerateContentController {
  if (!generateContentService) {
    throw new Error('generateContentService is required for generateContentController')
  }
  
  return {
    async generateContent(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      try {
        const query = (request.query || {}) as Record<string, string | string[]>
        const isTwitter = String(query.twitter ?? '').toLowerCase() === 'true'
        const isInstagram = String(query.instagram ?? '').toLowerCase() === 'true'
        // Support both JSON and multipart
        let requestData: GenerateContentRequestDto
        let imageUrls: string[] = []
        let bannerUrl: string | undefined

        if ((request as any).isMultipart && (request as any).isMultipart()) {
          const parts = (request as any).parts()
          let contentText = ''
          for await (const part of parts) {
            if (part.type === 'file') {
              const chunks: Buffer[] = []
              for await (const chunk of part.file) chunks.push(chunk as Buffer)
              const buffer = Buffer.concat(chunks)
              const url = await cloudinaryService.uploadBuffer({ buffer, filename: part.filename, mimeType: part.mimetype })
              // Treat 'banner' file field as banner image, others as gallery images
              if (part.fieldname === 'banner') bannerUrl = url
              else imageUrls.push(url)
            } else if (part.type === 'field') {
              if (part.fieldname === 'content') contentText = String(part.value || '')
              if (part.fieldname === 'bannerUrl') bannerUrl = String(part.value || '')
            }
          }
          requestData = { content: contentText, images: imageUrls, bannerUrl } as any
        } else {
          requestData = request.body as GenerateContentRequestDto
          imageUrls = Array.isArray((requestData as any).images) ? (requestData as any).images as string[] : []
          bannerUrl = (requestData as any).bannerUrl as string | undefined
        }

        const result: GenerateContentResponseDto = await generateContentService.generateContent({ ...requestData, images: imageUrls, bannerUrl } as any)

        // Prepare job IDs (so frontend can poll) and enqueue before responding to avoid race with polling
        const twitterJobId = isTwitter ? randomUUID() : undefined
        const instagramJobId = isInstagram ? randomUUID() : undefined

        try {
          if (twitterJobId) await socialMediaGenerationQueue.add(
            'generate-post',
            { platform: 'twitter', payload: result },
            { jobId: twitterJobId, removeOnComplete: { age: 3600 }, removeOnFail: { age: 86400 } }
          )
          if (instagramJobId) await socialMediaGenerationQueue.add(
            'generate-post',
            { platform: 'instagram', payload: result },
            { jobId: instagramJobId, removeOnComplete: { age: 3600 }, removeOnFail: { age: 86400 } }
          )
        } catch (e) {
          // do not fail the main request if enqueuing social jobs fails
        }
        
        reply.code(200).send({
          success: true,
          data: result,
          jobs: {
            twitterJobId: twitterJobId || undefined,
            instagramJobId: instagramJobId || undefined
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
