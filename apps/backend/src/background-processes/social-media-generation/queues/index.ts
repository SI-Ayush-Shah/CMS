import { Queue, QueueEvents } from 'bullmq'
import { redisConnection } from '../../../config/redis'

const socialMediaGenerationQueue = new Queue('social-media-generation-queue', {
  connection: redisConnection
})

// QueueEvents allow listeners (and jobs) to wait for completion/failure
const socialMediaGenerationQueueEvents = new QueueEvents('social-media-generation-queue', {
  connection: redisConnection
})

export { socialMediaGenerationQueue, socialMediaGenerationQueueEvents }


