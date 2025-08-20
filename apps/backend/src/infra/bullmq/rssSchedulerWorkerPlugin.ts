import fp from 'fastify-plugin'
import type { FastifyInstance } from 'fastify'
import path from 'path'
import { globSync } from 'glob'

async function rssSchedulerWorkerPlugin(fastify: FastifyInstance): Promise<void> {
  const startedWorkers: Array<{ close: () => Promise<void> }> = []

  const workersGlob = path.join(__dirname, '../../background-processes/**/workers/index.{ts,js}')
  const workerFiles = globSync(workersGlob, { nodir: true })

  for (const filePath of workerFiles) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require(filePath)
      const starter = mod.startWorker || mod.start || mod.default || mod.startRssSchedulerWorker
      if (typeof starter === 'function') {
        const worker = starter()
        if (worker && typeof worker.close === 'function') startedWorkers.push(worker)
        // eslint-disable-next-line no-console
        console.log(`Started worker from ${filePath}`)
      } else {
        // eslint-disable-next-line no-console
        console.warn(`No start function exported by ${filePath}`)
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`Failed to start worker from ${filePath}`, err)
    }
  }

  fastify.addHook('onClose', async () => {
    for (const worker of startedWorkers) {
      try {
        await worker.close()
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error closing worker', err)
      }
    }
    // eslint-disable-next-line no-console
    console.log('All workers closed')
  })
}

export default fp(rssSchedulerWorkerPlugin, {
  name: 'workers-autoloader-plugin'
})


