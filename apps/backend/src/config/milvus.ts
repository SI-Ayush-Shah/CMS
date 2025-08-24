import { MilvusClient } from '@zilliz/milvus2-sdk-node'
import { env } from './env'

let cachedMilvus: MilvusClient | null = null

export function getMilvus(): MilvusClient {
  if (cachedMilvus) return cachedMilvus
  const address = env.MILVUS_ADDRESS || 'localhost:19530'
  cachedMilvus = new MilvusClient({
    address,
    ssl: !!env.MILVUS_TLS,
    username: env.MILVUS_USERNAME,
    password: env.MILVUS_PASSWORD,
    database: env.MILVUS_DB || 'default'
  })
  return cachedMilvus
}


