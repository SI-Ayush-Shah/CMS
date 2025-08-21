import fp from 'fastify-plugin'
import axios from 'axios'
import { env, isDevelopment } from '../config/env'

/**
 * Fastify plugin that self-pings the service health endpoint every 30 seconds
 * to keep the service warm (useful on platforms that sleep idle apps).
 */
export default fp(async (fastify) => {
  // Disable in development by default
  if (isDevelopment) {
    fastify.log.info('Self-ping plugin disabled in development')
    return
  }

  // Prefer explicit SELF_PING_URL, otherwise fallback to Render URL provided
  const defaultRenderUrl = 'https://cms-9bjk.onrender.com/content-studio/api/health'
  const targetUrl = env.SELF_PING_URL || defaultRenderUrl

  // Start after a short delay to ensure the server is listening
  let timer: ReturnType<typeof setInterval> | null = null
  const start = () => {
    if (timer) return
    timer = setInterval(async () => {
      try {
        await axios.get(targetUrl, { timeout: 5000 })
      } catch (err: any) {
        // Log at debug level to avoid noise
        fastify.log.debug({ err }, 'Self-ping failed')
      }
    }, env.SELF_PING_INTERVAL_MS ?? 30_000)
  }

  fastify.addHook('onReady', async () => {
    // Small delay before first schedule
    setTimeout(start, 1000)
  })

  fastify.addHook('onClose', async () => {
    if (timer) clearInterval(timer as any)
    timer = null
  })
})


