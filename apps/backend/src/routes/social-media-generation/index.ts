import { FastifyPluginAsync } from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type, Static } from '@sinclair/typebox'
import '../../types/container'
import { Job } from 'bullmq'
import { socialMediaGenerationQueue, socialMediaGenerationQueueEvents } from '../../background-processes/social-media-generation/queues'

const JobStatusResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Object({
    id: Type.String(),
    state: Type.String(),
    progress: Type.Optional(Type.Any()),
    attemptsMade: Type.Optional(Type.Number()),
    failedReason: Type.Optional(Type.String()),
    returnValue: Type.Optional(Type.Any()),
  }),
})

const ErrorResponseSchema = Type.Object({ success: Type.Boolean(), error: Type.String() })

export type JobStatusResponse = Static<typeof JobStatusResponseSchema>

const socialRoutes: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>()

  server.route({
    method: 'GET',
    url: '/status/:id',
    schema: {
      params: Type.Object({ id: Type.String() }),
      response: { 200: JobStatusResponseSchema, 404: ErrorResponseSchema }
    },
    handler: async (request, reply) => {
      const { id } = request.params as { id: string }
      const waitParam = String((request.query as any)?.wait ?? '').toLowerCase()
      const waitMs = waitParam && waitParam !== 'false' ? Math.min(Number(waitParam) || 30000, 60000) : 0

      let job = await socialMediaGenerationQueue.getJob(id)
      if (!job) {
        if (waitMs > 0) {
          // If waiting, poll for the job to appear for a short initial window (up to 5s or waitMs)
          const appearTimeout = Math.min(waitMs, 5000)
          const start = Date.now()
          while (!job && Date.now() - start < appearTimeout) {
            await new Promise(r => setTimeout(r, 150))
            job = await socialMediaGenerationQueue.getJob(id)
          }
        }
        if (!job) return reply.code(404).send({ success: false, error: 'Job not found' })
      }

      if (waitMs > 0) {
        try {
          const result = await (job as any).waitUntilFinished(socialMediaGenerationQueueEvents, waitMs)
          return reply.send({ success: true, data: { id, state: 'completed', progress: job.progress, attemptsMade: job.attemptsMade, failedReason: undefined, returnValue: result } })
        } catch (err: any) {
          const state = await job.getState()
          const progress = job.progress
          const attemptsMade = job.attemptsMade
          const failedReason = (job as any).failedReason as string | undefined
          const returnValue = (job as any).returnvalue
          return reply.send({ success: true, data: { id, state, progress, attemptsMade, failedReason, returnValue } })
        }
      }

      const state = await job.getState()
      const progress = job.progress
      const attemptsMade = job.attemptsMade
      const failedReason = (job as any).failedReason as string | undefined
      const returnValue = (job as any).returnvalue
      return reply.send({ success: true, data: { id, state, progress, attemptsMade, failedReason, returnValue } })
    }
  })
}

export default socialRoutes


