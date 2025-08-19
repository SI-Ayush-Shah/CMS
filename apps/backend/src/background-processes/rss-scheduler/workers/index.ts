import { Worker, Job } from 'bullmq';
import { redisConnection } from '../../../config/redis'

let rssSchedulerWorkerInstance: Worker | null = null

export function startRssSchedulerWorker(): Worker {
  if (rssSchedulerWorkerInstance) return rssSchedulerWorkerInstance

  const worker = new Worker('rss-scheduler-queue', async (job: Job) => {
    if (job.name === 'scrape-feed') {
      const { feedId } = job.data
      console.log('Scraping feed', feedId)
    }
    return 'ok'
  }, { connection: redisConnection })

  worker.on('error', (err) => {
    console.error('Worker error:', err)
  })

  worker.on('ready', () => {
    console.log('RSS scheduler worker is ready')
  })

  worker.on('closed', () => {
    console.log('Worker closed')
  })

  worker.on('completed', (_job: Job) => {
    // Intentionally quiet to avoid noisy logs
  })

  rssSchedulerWorkerInstance = worker
  return worker
}

// Generic entry used by the worker auto-loader plugin
export const startWorker = startRssSchedulerWorker
