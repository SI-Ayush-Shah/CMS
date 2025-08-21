import { createClient } from 'redis'
import { env } from './env'

export type AppRedisClient = ReturnType<typeof createClient>


export const redisConnection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  username: env.REDIS_USERNAME,
  password: env.REDIS_PASSWORD,
}


let cachedClient: AppRedisClient | null = null

export async function createRedisClient(): Promise<AppRedisClient | null> {
  try {
    // Return existing connected client (singleton)
    if (cachedClient && (cachedClient as any).isOpen) {
      return cachedClient
    }
    const hasDiscreteConfig = !!env.REDIS_HOST || !!env.REDIS_PORT || !!env.REDIS_USERNAME || !!env.REDIS_PASSWORD

    const client = hasDiscreteConfig
      ? createClient({
          username: env.REDIS_USERNAME || 'default',
          password: env.REDIS_PASSWORD,
          socket: {
            host: env.REDIS_HOST || '127.0.0.1',
            port: env.REDIS_PORT || 6379,
          },
        })
      : createClient({
          url: env.REDIS_URL || 'redis://localhost:6379',
        })

    client.on('error', (err) => {
      console.error('Redis Client Error', err)
    })

    await client.connect()
    console.log('✅ Redis connected')
    cachedClient = client
    return cachedClient
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error)
    return null
  }
}


