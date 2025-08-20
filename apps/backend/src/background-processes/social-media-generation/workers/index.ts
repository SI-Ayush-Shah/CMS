import { Worker, Job } from 'bullmq'
import { redisConnection } from '../../../config/redis'
import { createSocialMediaContentService } from '../../../services/SocialMediaContentService'

let socialWorkerInstance: Worker | null = null

export function startSocialMediaGenerationWorker(): Worker {
  if (socialWorkerInstance) return socialWorkerInstance

  const worker = new Worker('social-media-generation-queue', async (job: Job) => {
    const { platform, payload } = job.data || {}
    if (job.name === 'generate-post') {
      console.log('[social-media-generation] generate-post', { platform, payloadId: payload?.blogId || payload?.id })
      const service = createSocialMediaContentService()
      // payload.generatedContent has title, summary, body, etc. We use it to generate social media assets
      const params = {
        title: payload?.generatedContent?.title ?? payload?.title ?? 'Untitled',
        content: JSON.stringify(payload?.generatedContent?.body ?? {}),
        summary: payload?.generatedContent?.summary ?? payload?.summary ?? '',
        link: payload?.generatedContent?.link ?? payload?.link,
      }
      const result = await service.generateContent(params)
      return { status: 'completed', platform, result }
    }
    return 'ok'
  }, { connection: redisConnection })

  worker.on('error', (err) => {
    console.error('Social media worker error:', err)
  })

  worker.on('ready', () => {
    console.log('Social media generation worker is ready')
  })

  socialWorkerInstance = worker
  return worker
}

export const startWorker = startSocialMediaGenerationWorker


